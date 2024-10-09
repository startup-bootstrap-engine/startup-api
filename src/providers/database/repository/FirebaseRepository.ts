import { zodToObject } from "@entities/schemaUtils";
import admin from "firebase-admin";
import { provide } from "inversify-binding-decorators";
import { ZodObject, ZodSchema } from "zod";
import { FirebaseAdapter } from "../adapters/FirebaseAdapter";
import { IRepositoryAdapter } from "../DatabaseTypes";
import { ModelUtils } from "../utils/ModelUtils";

@provide(FirebaseRepository)
export class FirebaseRepository<T> implements IRepositoryAdapter<T> {
  private database: admin.database.Database | undefined;
  private dbRef: admin.database.Reference;
  private schema: ZodObject<any>;

  constructor(private firebaseAdapter: FirebaseAdapter, private modelUtils: ModelUtils) {}

  public init(modelName: string, schema: ZodObject<any>): void {
    if (!modelName) {
      throw new Error("Model not initialized");
    }

    this.schema = schema;

    this.database = this.firebaseAdapter.getDatabase();

    if (!this.database) {
      return;
    }

    // Initialize dbRef with the collection name
    this.dbRef = this.database.ref(this.modelUtils.getModelNamePluralized(modelName));
  }

  public async create(item: T): Promise<T> {
    this.basicValidations();

    const dbItem = zodToObject<T>(this.schema as ZodSchema, item);

    // Generate a key first
    const newKey = this.dbRef.push().key;

    if (!newKey) {
      throw new Error("Failed to generate key for new item");
    }

    const newItemRef = this.dbRef.child(newKey);
    await newItemRef.set({
      ...dbItem,
      _id: newKey.toString(),
    });

    return { ...dbItem, id: newKey } as T;
  }

  public async findById(id: string): Promise<T | null> {
    this.basicValidations();

    const snapshot = await this.dbRef.child(id).once("value");
    const data = snapshot.val();
    return data ? { ...data, id } : null;
  }

  public async findBy(params: Record<string, unknown>): Promise<T | null> {
    this.basicValidations();

    const keys = Object.keys(params);
    if (keys.length === 0) {
      return null;
    }
    const key = keys[0];
    const value = params[key];
    const query = this.dbRef.orderByChild(key).equalTo(value as string | number | boolean);
    const snapshot = await query.once("value");
    if (snapshot.exists()) {
      const data = snapshot.val();
      const firstKey = Object.keys(data)[0];
      return { ...data[firstKey], id: firstKey };
    }
    return null;
  }

  public async findAll(params?: Record<string, unknown>): Promise<T[]> {
    this.basicValidations();

    let query: admin.database.Query = this.dbRef;
    if (params) {
      Object.keys(params).forEach((key) => {
        query = query.orderByChild(key).equalTo(params[key] as string | number | boolean);
      });
    }
    const snapshot = await query.once("value");
    const items: T[] = [];
    snapshot.forEach((childSnapshot) => {
      items.push({ ...childSnapshot.val(), id: childSnapshot.key });
      return false; // Continue iterating
    });
    return items;
  }

  public async updateById(id: string, item: Partial<T>): Promise<T | null> {
    this.basicValidations();

    const itemRef = this.dbRef.child(id);
    await itemRef.update(item);
    const updatedSnapshot = await itemRef.once("value");
    const updatedData = updatedSnapshot.val();
    return updatedData ? { ...updatedData, id } : null;
  }

  public async updateBy(params: Record<string, unknown>, item: Partial<T>): Promise<T | null> {
    this.basicValidations();

    const keys = Object.keys(params);
    if (keys.length === 0) {
      return null;
    }
    const key = keys[0];
    const value = params[key];
    const query = this.dbRef.orderByChild(key).equalTo(value as string | number | boolean);
    const snapshot = await query.once("value");
    if (snapshot.exists()) {
      let updatedItem: T | null = null;
      let childSnapshot: admin.database.DataSnapshot | null = null;
      snapshot.forEach((snap) => {
        childSnapshot = snap;
        return true; // Stop after first match
      });
      if (childSnapshot) {
        // @ts-ignore
        await childSnapshot.ref.update(item);
        // @ts-ignore
        updatedItem = { ...childSnapshot.val(), id: childSnapshot.key };
      }
      return updatedItem;
    }
    return null;
  }

  public async delete(id: string): Promise<boolean> {
    this.basicValidations();

    await this.dbRef.child(id).remove();
    return true;
  }

  public async exists(params: Record<string, unknown>): Promise<boolean> {
    this.basicValidations();

    const keys = Object.keys(params);
    if (keys.length === 0) {
      return false;
    }
    const key = keys[0];
    const value = params[key];
    const query = this.dbRef.orderByChild(key).equalTo(value as string | number | boolean);
    const snapshot = await query.once("value");
    return snapshot.exists();
  }

  private basicValidations(): void {
    if (!this.dbRef) {
      throw new Error("Database reference not initialized");
    }

    if (!this.schema) {
      throw new Error("Schema not initialized");
    }
  }
}
