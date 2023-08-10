import {
  AppleConnectedDevice,
  AppleDevice,
  Emulator,
  Simulator,
} from "eas-shared";
import { Platform } from "../utils";

type Device<P> = P extends Platform.Ios
  ? Simulator.IosSimulator
  : P extends Platform.Android
  ? Emulator.AndroidDevice
  : Simulator.IosSimulator | Emulator.AndroidDevice;

export async function listDevicesAsync<P extends Platform>({
  platform,
}: {
  platform: P;
}): Promise<Device<P>[]> {
  let availableAndroidDevices: Emulator.AndroidDevice[] = [];
  let availableIosDevices: Array<
    Simulator.IosSimulator | AppleConnectedDevice
  > = [];

  if (platform === "ios" || platform === "all") {
    try {
      availableIosDevices = availableIosDevices.concat(
        await Simulator.getAvaliableIosSimulatorsListAsync()
      );

      const connectedDevices = await AppleDevice.getConnectedDevicesAsync();
      const uniqueConnectedDevices = connectedDevices.filter(
        (element, index) => {
          return (
            connectedDevices.findIndex(({ udid }) => udid === element.udid) !==
            index
          );
        }
      );

      availableIosDevices = availableIosDevices.concat(uniqueConnectedDevices);
    } catch (error) {
      console.warn("Unable to get iOS devices", error);
    }
  }

  if (platform === Platform.Android || platform === "all") {
    try {
      const runningDevices = await Emulator.getRunningDevicesAsync();

      availableAndroidDevices = (
        await Emulator.getAvailableAndroidEmulatorsAsync()
      )?.map((emulator) => {
        const runningEmulator = runningDevices.find(
          (r) => r.deviceType === "emulator" && r.name === emulator.name
        );
        return {
          ...emulator,
          state: runningEmulator ? "Booted" : "Shutdown",
          pid: runningEmulator?.pid,
        };
      });
      availableAndroidDevices = availableAndroidDevices.concat(
        runningDevices.filter((r) => r.deviceType === "device")
      );
    } catch (error) {
      console.warn("Unable to get Android devices", error);
    }
  }

  let result = new Array<Device<P>>();
  if (
    (platform === "all" || platform === Platform.Ios) &&
    availableIosDevices?.length
  ) {
    result = result.concat(availableIosDevices as Device<P>[]);
  }

  if (
    (platform === "all" || platform === Platform.Android) &&
    availableAndroidDevices.length
  ) {
    result = result.concat(availableAndroidDevices as Device<P>[]);
  }

  return result;
}
