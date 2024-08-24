import { provide } from "inversify-binding-decorators";

@provide(ServerRequest)
export class ServerRequest {
  public isInternalRequest(ip: string): boolean {
    return ip.includes("::ffff:") || ip.includes("172.") || ip.includes("10.");
  }
}
