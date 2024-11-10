import sgMail from "@sendgrid/mail";
import { provide } from "inversify-binding-decorators";
import SibApiV3Sdk from "sib-api-v3-sdk";
import { appEnv } from "../src/providers/config/env";
import { IEmailProvider } from "./email.types";

@provide(TransactionalEmailProviders)
export class TransactionalEmailProviders {
  private providers: IEmailProvider[];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // SENDGRID setup
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    // SENDINBLUE setup
    const sendInBlueClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = sendInBlueClient.authentications["api-key"];
    apiKey.apiKey = appEnv.transactionalEmail.sendInBlue.SENDINBLUE_API_KEY;
    const sendInBlueAPIInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    this.providers = [
      {
        key: "SENDINBLUE",
        credits: 300,
        emailSendingFunction: async (to, from, subject, html, text): Promise<boolean> => {
          const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

          sendSmtpEmail.to = [{ email: to }];
          sendSmtpEmail.sender = { email: from, name: process.env.APP_NAME };
          sendSmtpEmail.htmlContent = html;
          sendSmtpEmail.textContent = text;
          sendSmtpEmail.subject = subject;

          try {
            const sendInBlueRequest = await sendInBlueAPIInstance.sendTransacEmail(sendSmtpEmail);
            console.log("SendInBlue: API called successfully. Returned data: ");
            console.log(JSON.stringify(sendInBlueRequest, null, 2));
            return true;
          } catch (error) {
            console.log("Error in SendInBlue request!");
            console.error(error);
            return false;
          }
        },
      },
      {
        key: "SENDGRID",
        credits: 100,
        emailSendingFunction: async (to, from, subject, html, text): Promise<boolean> => {
          try {
            await sgMail.send({
              to,
              from: {
                email: from,
                name: process.env.APP_NAME,
              },
              subject,
              html,
              text,
            });
            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        },
      },
    ];
  }

  public getProviders(): IEmailProvider[] {
    return this.providers;
  }
}
