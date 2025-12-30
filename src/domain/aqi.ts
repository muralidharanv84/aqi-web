export type AqiCategory = {
  label: string;
  color: string;
  description: string;
  min: number;
  max: number;
};

const AQI_CATEGORIES: AqiCategory[] = [
  {
    min: 0,
    max: 50,
    label: "Good",
    color: "#00E400",
    description: "Air quality is satisfactory.",
  },
  {
    min: 51,
    max: 100,
    label: "Moderate",
    color: "#FFFF00",
    description: "Acceptable air quality.",
  },
  {
    min: 101,
    max: 150,
    label: "Unhealthy for Sensitive Groups",
    color: "#FF7E00",
    description: "Sensitive groups may feel effects.",
  },
  {
    min: 151,
    max: 200,
    label: "Unhealthy",
    color: "#FF0000",
    description: "Everyone may feel effects.",
  },
  {
    min: 201,
    max: 300,
    label: "Very Unhealthy",
    color: "#8F3F97",
    description: "Health alert: increased risk.",
  },
  {
    min: 301,
    max: Number.POSITIVE_INFINITY,
    label: "Hazardous",
    color: "#7E0023",
    description: "Emergency conditions.",
  },
];

export function getAqiCategory(aqi: number): AqiCategory {
  for (const category of AQI_CATEGORIES) {
    if (aqi >= category.min && aqi <= category.max) {
      return category;
    }
  }
  return AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
}

export function getAqiCategoryForValue(aqi: number): AqiCategory {
  return getAqiCategory(Math.round(aqi));
}
