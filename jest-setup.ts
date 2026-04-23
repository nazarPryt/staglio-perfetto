import { jest } from "@jest/globals";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
