module {
  type OldSparePart = {
    partNumber : Text;
    description : Text;
    location : Text;
    category : Text;
    currentStock : Nat;
    uom : Text;
    room : Text;
    cabinet : Text;
    rackSlot : Text;
  };

  type OldRecord = {
    partsArray : [OldSparePart];
    uploadTimestamp : Int;
  };

  type OldActor = {
    var datasetRecord : ?OldRecord;
    var maintenancePassword : Text;
  };

  type NewSparePart = {
    partNumber : Text;
    description : Text;
    location : Text;
    category : Text;
    currentStock : Nat;
    uom : Text;
    room : Text;
    cabinet : Text;
    rackSlot : Text;
  };

  type NewRecord = {
    partsArray : [NewSparePart];
    uploadTimestamp : Int;
  };

  type NewActor = {
    datasetRecord : ?NewRecord;
    var maintenancePassword : Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      datasetRecord = old.datasetRecord;
      var maintenancePassword = old.maintenancePassword;
    };
  };
};

