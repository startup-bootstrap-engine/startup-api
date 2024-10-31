import { cache } from "@providers/constants/CacheConstants";
import { ICountry, ICountryCity } from "@startup-engine/shared/dist";
import { Response } from "express";
import { controller, httpGet, interfaces, requestParam, response } from "inversify-express-utils";
import { ReadPlaceUseCase } from "./read/ReadPlaceUseCase";

@controller("/places", cache("24 hours"))
export class PlacesController implements interfaces.Controller {
  constructor(private readPlaceUseCase: ReadPlaceUseCase) {}

  @httpGet("/country/:code")
  public country(@requestParam() params, @response() res: Response): Response<ICountryCity> {
    const { code } = params;
    // Normalize country code to uppercase
    const normalizedCode = code.toUpperCase();

    const result = this.readPlaceUseCase.readCountry(normalizedCode);

    // Set cache header explicitly
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours
    return res.json(result);
  }

  @httpGet("/countries")
  public countries(@response() res: Response): Response<ICountry[]> {
    const result = this.readPlaceUseCase.readCountries();

    // Set cache header explicitly
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours
    return res.json(result);
  }

  @httpGet("/:countryNameOrCode/cities")
  public cities(@requestParam() params, @response() res: Response): Response<string[]> {
    const { countryNameOrCode } = params;

    // If it's a 2-letter code, normalize to uppercase
    const normalizedInput = countryNameOrCode.length === 2 ? countryNameOrCode.toUpperCase() : countryNameOrCode;

    const result = this.readPlaceUseCase.readCities(normalizedInput);

    // Set cache header explicitly
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours
    return res.json(result);
  }
}
