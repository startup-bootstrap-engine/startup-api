import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { MapControlTimeModel } from "@entities/ModuleSystem/MapControlTimeModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { WateringByRain } from "@providers/plant/WateringByRain";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AvailableWeather, IControlTime, PeriodOfDay, WeatherSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import random from "lodash/random";

@provide(MapControlTime)
export class MapControlTime {
  constructor(private socketMessaging: SocketMessaging, private wateringByRain: WateringByRain) {}

  public getRandomWeather(): AvailableWeather {
    const n = random(0, 100);

    if (n < 60) {
      return AvailableWeather.Standard;
    } else {
      return AvailableWeather.SoftRain;
    }
  }

  @TrackNewRelicTransaction()
  public async controlTime(time: string, periodOfDay: PeriodOfDay): Promise<IControlTime> {
    const onlineCharacters = await Character.find({ isOnline: true });

    const dataOfWeather: IControlTime = {
      time: time,
      period: periodOfDay,
      weather: this.getRandomWeather(),
    };

    // Delete old registry
    await MapControlTimeModel.deleteMany();

    // Create new one
    await MapControlTimeModel.create(dataOfWeather);

    if (dataOfWeather.weather === AvailableWeather.SoftRain || dataOfWeather.weather === AvailableWeather.HeavyRain) {
      await this.wateringByRain.wateringPlants();
    }

    for (const character of onlineCharacters) {
      this.socketMessaging.sendEventToUser<IControlTime>(
        character.channelId!,
        WeatherSocketEvents.TimeWeatherControl,
        dataOfWeather
      );
    }

    return dataOfWeather;
  }
}
