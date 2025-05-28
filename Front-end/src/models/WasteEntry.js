export const WasteType = {
  DANGEROUS: "Peligroso",
  RECYCLABLE: "Reciclable",
  ORGANIC: "Orgánico",
  GENERAL: "General",
}

export class WasteEntry {
  constructor(
    id,
    transporterPlate,
    transporterCompany,
    grossWeight,
    tareWeight,
    wasteType,
    timestamp,
    receiptPhoto = null
  ) {
    this.id = id
    this.transporterPlate = transporterPlate
    this.transporterCompany = transporterCompany
    this.grossWeight = grossWeight
    this.tareWeight = tareWeight
    this.wasteType = wasteType
    this.timestamp = timestamp
    this.receiptPhoto = receiptPhoto
  }

  get netWeight() {
    return this.grossWeight - this.tareWeight
  }

  get formattedWeight() {
    return `${this.grossWeight.toLocaleString()} / ${this.tareWeight.toLocaleString()} kg`
  }

  toJSON() {
    return {
      id: this.id,
      transporterPlate: this.transporterPlate,
      transporterCompany: this.transporterCompany,
      grossWeight: this.grossWeight,
      tareWeight: this.tareWeight,
      wasteType: this.wasteType,
      timestamp: this.timestamp,
      receiptPhoto: this.receiptPhoto,
      netWeight: this.netWeight,
      formattedWeight: this.formattedWeight
    }
  }
} 