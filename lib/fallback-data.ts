export function getCheltenhamFallbackData(date: string) {
    // Generate realistic Cheltenham races based on the day
    const dayMap: Record<string, string> = {
        "2026-03-10": "Tuesday (Champion Hurdle Day)",
        "2026-03-11": "Wednesday (Champion Chase Day)",
        "2026-03-12": "Thursday (Stayers' Hurdle Day)",
        "2026-03-13": "Friday (Gold Cup Day)",
    };

    const isTuesday = date === "2026-03-10";
    const isWednesday = date === "2026-03-11";
    const isThursday = date === "2026-03-12";
    const isFriday = date === "2026-03-13";

    if (isTuesday) {
        return [
            {
                race_id: "c-tue-1",
                off_time: `${date} 13:30:00`,
                race_name: "Supreme Novices' Hurdle (Grade 1)",
                race_class: "Grade 1",
                distance_f: 16,
                going: "Soft",
                runners: [
                    { horse_id: "tue1-1", name: "Mystical Power", official_rating: "152", odds_decimal: "3.5", form: "11-21" },
                    { horse_id: "tue1-2", name: "Jeriko Du Reponet", official_rating: "148", odds_decimal: "5.0", form: "1-11" },
                    { horse_id: "tue1-3", name: "Firenze", official_rating: "145", odds_decimal: "9.0", form: "2-13" },
                    { horse_id: "tue1-4", name: "Tullyhill", official_rating: "144", odds_decimal: "15.0", form: "1-14" },
                    { horse_id: "tue1-5", name: "Slade Steel", official_rating: "146", odds_decimal: "6.0", form: "1-22" },
                ]
            },
            {
                race_id: "c-tue-2",
                off_time: `${date} 15:30:00`,
                race_name: "Champion Hurdle Challenge Trophy (Grade 1)",
                race_class: "Grade 1",
                distance_f: 16.5,
                going: "Soft",
                runners: [
                    { horse_id: "tue2-1", name: "State Man", official_rating: "169", odds_decimal: "1.8", form: "1-111" },
                    { horse_id: "tue2-2", name: "Constitution Hill", official_rating: "175", odds_decimal: "2.5", form: "1-11-" },
                    { horse_id: "tue2-3", name: "Irish Point", official_rating: "159", odds_decimal: "8.0", form: "1-21" },
                    { horse_id: "tue2-4", name: "Not So Sleepy", official_rating: "152", odds_decimal: "21.0", form: "3-41" },
                    { horse_id: "tue2-5", name: "Zarak The Brave", official_rating: "150", odds_decimal: "34.0", form: "1-3P" }
                ]
            }
        ];
    } else if (isWednesday) {
        return [
            {
                race_id: "c-wed-1",
                off_time: `${date} 15:30:00`,
                race_name: "Queen Mother Champion Chase",
                race_class: "Grade 1",
                distance_f: 16,
                going: "Soft",
                runners: [
                    { horse_id: "wed1-1", name: "El Fabiolo", official_rating: "170", odds_decimal: "2.1", form: "1-11P" },
                    { horse_id: "wed1-2", name: "Jonbon", official_rating: "170", odds_decimal: "3.5", form: "1-121" },
                    { horse_id: "wed1-3", name: "Edwardstone", official_rating: "161", odds_decimal: "9.0", form: "2-1F" },
                    { horse_id: "wed1-4", name: "Captain Guinness", official_rating: "162", odds_decimal: "12.0", form: "3-11" },
                ]
            }
        ];
    } else if (isThursday) {
        return [
            {
                race_id: "c-thu-1",
                off_time: `${date} 15:30:00`,
                race_name: "Stayers' Hurdle",
                race_class: "Grade 1",
                distance_f: 24,
                going: "Heavy",
                runners: [
                    { horse_id: "thu1-1", name: "Teahupoo", official_rating: "163", odds_decimal: "3.0", form: "1-11" },
                    { horse_id: "thu1-2", name: "Irish Point", official_rating: "159", odds_decimal: "4.5", form: "1-22" },
                    { horse_id: "thu1-3", name: "Crambo", official_rating: "153", odds_decimal: "8.0", form: "1-13" },
                    { horse_id: "thu1-4", name: "Noble Yeats", official_rating: "155", odds_decimal: "11.0", form: "2-1F" },
                    { horse_id: "thu1-5", name: "Sire Du Berlais", official_rating: "158", odds_decimal: "15.0", form: "P-31" },
                ]
            }
        ];
    } else if (isFriday) {
        return [
            {
                race_id: "c-fri-1",
                off_time: `${date} 15:30:00`,
                race_name: "Cheltenham Gold Cup",
                race_class: "Grade 1",
                distance_f: 26.5,
                going: "Heavy",
                runners: [
                    { horse_id: "fri1-1", name: "Galopin Des Champs", official_rating: "180", odds_decimal: "2.2", form: "1-11" },
                    { horse_id: "fri1-2", name: "Fastorslow", official_rating: "171", odds_decimal: "5.5", form: "2-12" },
                    { horse_id: "fri1-3", name: "Gerri Colombe", official_rating: "170", odds_decimal: "8.0", form: "1-21" },
                    { horse_id: "fri1-4", name: "L'Homme Presse", official_rating: "165", odds_decimal: "12.0", form: "1-14" },
                    { horse_id: "fri1-5", name: "Corach Rambler", official_rating: "159", odds_decimal: "17.0", form: "3-13" },
                    { horse_id: "fri1-6", name: "Bravemansgame", official_rating: "167", odds_decimal: "26.0", form: "2-22" }
                ]
            }
        ];
    }

    // Default fallback if a different date is requested
    return [];
}
