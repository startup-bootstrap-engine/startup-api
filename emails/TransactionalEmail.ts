import { LogRepository } from "@repositories/ModuleSystem/LogRepository";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { EnvType } from "@startup-engine/shared/dist";
import { readFileSync } from "fs";
import { provide } from "inversify-binding-decorators";
import moment from "moment-timezone";
import { EncryptionHelper } from "../src/providers/auth/EncryptionHelper";
import { appEnv } from "../src/providers/config/env";
import { TextHelper } from "../src/providers/text/TextHelper";
import { TransactionalEmailProviders } from "./TransactionalEmailProviders";
import { EmailType } from "./email.types";

@provide(TransactionalEmail)
export class TransactionalEmail {
  constructor(
    private userRepository: UserRepository,
    private logRepository: LogRepository,
    private emailProviders: TransactionalEmailProviders
  ) {}

  public async send(
    to: string | undefined,
    subject: string,
    template: string,
    customVars?: object,
    from: string | undefined = appEnv.general.ADMIN_EMAIL
  ): Promise<boolean> {
    if (appEnv.general.ENV === EnvType.Development) {
      console.log("Skipping e-mail submission, since you cannot submit e-mails on Development");
      return false;
    }

    const html = this.loadEmailTemplate(EmailType.Html, template, customVars);
    const text = this.loadEmailTemplate(EmailType.Text, template, customVars);

    const today = moment.tz(new Date(), appEnv.general.TIMEZONE!).format("YYYY-MM-DD[T00:00:00.000Z]");

    for (const emailProvider of this.emailProviders.getProviders()) {
      try {
        const providerEmailsToday = await this.logRepository.findLogsByAction(
          `${emailProvider.key}_EMAIL_SUBMISSION`,
          new Date(today)
        );

        if (providerEmailsToday.length < emailProvider.credits) {
          console.log("Smart sending email...");

          console.log(`Using ${emailProvider.key} to submit email...`);

          console.log(`Credits balance today: ${providerEmailsToday.length}/${emailProvider.credits}`);

          const user = await this.userRepository.findBy({ email: to });

          if (!user) {
            console.log("This user is not in our database! Skipping sending e-mail");
            return false;
          }

          if (user?.unsubscribed === true) {
            console.log("Skipping email submission to unsubscribed user");
            return true;
          }

          if (!to) {
            console.log('You should provide a valid "to" email');
            return false;
          }

          const encryptionHelper = new EncryptionHelper();
          const encryptedEmail = encryptionHelper.encrypt(to);

          const htmlWithUnsubscribeLink = html.replace(
            "[Unsubscribe Link]",
            `<a href="${appEnv.general.API_URL!}/users/unsubscribe?hashEmail=${encryptedEmail}&lang=${appEnv.general.LANGUAGE!}">Do you want to stop receiving these e-mails? Click here!</p>`
          );

          const submissionStatus = await emailProvider.emailSendingFunction(
            to,
            from,
            subject,
            htmlWithUnsubscribeLink,
            text
          );

          if (submissionStatus) {
            await this.logRepository.createLog(`${emailProvider.key}_EMAIL_SUBMISSION`, from!, to!);

            console.log(`E-mail submitted to ${to} successfully!`);

            return true;
          } else {
            return false;
          }
        }
      } catch (error) {
        console.log(`Failed to submit email through ${emailProvider.key}`);
        console.error(error);
        return false;
      }
    }

    return false;
  }

  private loadEmailTemplate(type: EmailType, template: string, customVars?: object): string {
    let extension;

    if (type === EmailType.Html) {
      extension = ".html";
    } else if (type === EmailType.Text) {
      extension = ".txt";
    }

    const content = readFileSync(
      `${appEnv.transactionalEmail.templatesFolder}/${template}/content${extension}`,
      "utf-8"
    ).toString();

    if (customVars) {
      return this._replaceTemplateCustomVars(content, customVars);
    }

    return content;
  }

  private _replaceTemplateCustomVars(html: string, customVars: object): string {
    const keys = Object.keys(customVars);

    const globalTemplateVars = {
      "Product Name": appEnv.transactionalEmail.general.GLOBAL_VAR_PRODUCT_NAME,
      "Sender Name": appEnv.transactionalEmail.general.GLOBAL_VAR_SENDER_NAME,
      "Company Name, LLC": appEnv.transactionalEmail.general.GLOBAL_VAR_COMPANY_NAME_LLC,
      "Company Address": appEnv.transactionalEmail.general.GLOBAL_VAR_COMPANY_ADDRESS,
    };

    const globalKeys = Object.keys(globalTemplateVars);

    if (keys) {
      for (const key of keys) {
        html = TextHelper.replaceAll(html, `{{${key}}}`, customVars[key]);
      }
    }

    if (globalKeys) {
      for (const globalKey of globalKeys) {
        html = TextHelper.replaceAll(html, `[${globalKey}]`, globalTemplateVars[globalKey]);
      }
    }

    return html;
  }
}
