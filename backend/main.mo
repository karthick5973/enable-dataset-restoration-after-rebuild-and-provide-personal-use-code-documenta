import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Migration "migration";

// Specify the data migration function in the with-clause
(with migration = Migration.run)
actor {
  type PartNumber = Text;
  type SparePart = {
    partNumber : PartNumber;
    description : Text;
    location : Text;
    category : Text;
    currentStock : Nat;
    uom : Text;
    room : Text;
    cabinet : Text;
    rackSlot : Text;
  };

  module SparePart {
    public func compare(a : SparePart, b : SparePart) : Order.Order {
      switch (Text.compare(a.partNumber, b.partNumber)) {
        case (#equal) { Text.compare(a.location, b.location) };
        case (nonEqual) { nonEqual };
      };
    };
  };

  type DatasetRecord = {
    partsArray : [SparePart];
    uploadTimestamp : Time.Time;
  };

  var datasetRecord : ?DatasetRecord = null;
  var maintenancePassword = "Kiml@5973";
  let retentionPeriodNanos : Int = 7 * 24 * 60 * 60 * 1_000_000_000;

  type UploadResponse = {
    #success;
    #passwordIncorrect;
  };

  type RetentionStatus = {
    dataExists : Bool;
    timeRemaining : Int; // nanoseconds
  };

  public query ({}) func getRetentionStatus() : async RetentionStatus {
    switch (datasetRecord) {
      case (null) {
        { dataExists = false; timeRemaining = 0 };
      };
      case (?record) {
        let now = Time.now();
        let timeRemaining = record.uploadTimestamp + retentionPeriodNanos - now;
        { dataExists = timeRemaining > 0; timeRemaining };
      };
    };
  };

  /// Upload new array of spare parts, replacing the current dataset.
  /// The upload only succeeds if the provided password matches the maintenance password.
  public shared ({}) func uploadDataset(newPartsArray : [SparePart], password : Text) : async UploadResponse {
    if (maintenancePassword != password) {
      return #passwordIncorrect;
    };

    let record : DatasetRecord = {
      partsArray = newPartsArray;
      uploadTimestamp = Time.now();
    };

    datasetRecord := ?record;

    #success;
  };

  public query ({}) func getImportStatus() : async Nat {
    switch (datasetRecord) {
      case (?record) { record.partsArray.size() };
      case (null) { 0 };
    };
  };

  public query ({}) func getAllSpareParts() : async [SparePart] {
    switch (datasetRecord) {
      case (?record) { record.partsArray };
      case (null) { [] };
    };
  };

  public query ({}) func verifyMaintenancePassword(password : Text) : async Bool {
    password == maintenancePassword;
  };

  public shared ({ caller }) func changeMaintenancePassword(oldPassword : Text, newPassword : Text) : async Bool {
    if (oldPassword == maintenancePassword) {
      maintenancePassword := newPassword;
      true;
    } else {
      false;
    };
  };
};

