export enum UnitType {
  PHYSICAL_ASSET = 'PHYSICAL_ASSET',
  DIGITAL_ASSET = 'DIGITAL_ASSET',
  FUNDS = 'FUNDS',
  TIME = 'TIME',
}

export enum TransactionType {
  // create a new asset, cause,...
  Create = 'CREATE',
  // transfer to person, organization, cause
  Transfer = 'TRANSFER',
}

export enum ResourceType {
  Funds = 'FUNDS',
  Time = 'TIME',
  PhysicalAsset = 'PHYSICAL_ASSET',
  DigitalAsset = 'DIGITAL_ASSET',
}
