import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PartNumber = string;
export interface SparePart {
    uom: string;
    partNumber: PartNumber;
    room: string;
    description: string;
    cabinet: string;
    rackSlot: string;
    category: string;
    currentStock: bigint;
    location: string;
}
export interface RetentionStatus {
    dataExists: boolean;
    timeRemaining: bigint;
}
export enum UploadResponse {
    passwordIncorrect = "passwordIncorrect",
    success = "success"
}
export interface backendInterface {
    changeMaintenancePassword(oldPassword: string, newPassword: string): Promise<boolean>;
    getAllSpareParts(): Promise<Array<SparePart>>;
    getImportStatus(): Promise<bigint>;
    getRetentionStatus(): Promise<RetentionStatus>;
    /**
     * / Upload new array of spare parts, replacing the current dataset.
     * / The upload only succeeds if the provided password matches the maintenance password.
     */
    uploadDataset(newPartsArray: Array<SparePart>, password: string): Promise<UploadResponse>;
    verifyMaintenancePassword(password: string): Promise<boolean>;
}
