export const iTunesCategories = {
  arts: {
    name: "Arts"
  },
  design: {
    name: "Design",
    parent: "arts"
  },
  fashion_and_beauty: {
    name: "Fashion & Beauty",
    parent: "arts"
  },
  food: {
    name: "Food",
    parent: "arts"
  },
  literature: {
    name: "Literature",
    parent: "arts"
  },
  performing_arts: {
    name: "Performing Arts",
    parent: "arts"
  },
  visual_arts: {
    name: "Visual Arts",
    parent: "arts"
  },
  business: {
    name: "Business"
  },
  business_news: {
    name: "Business News",
    parent: "business"
  },
  careers: {
    name: "Careers",
    parent: "business"
  },
  investing: {
    name: "Investing",
    parent: "business"
  },
  management_and_marketing: {
    name: "Management & Marketing",
    parent: "business"
  },
  shopping: {
    name: "Shopping",
    parent: "business"
  },
  comedy: {
    name: "Comedy"
  },
  education: {
    name: "Education"
  },
  education_subcategory: {
    name: "Education",
    parent: "education"
  },
  education_technology: {
    name: "Education Technology",
    parent: "education"
  },
  higher_education: {
    name: "Higher Education",
    parent: "education"
  },
  k_12: {
    name: "K-12",
    parent: "education"
  },
  language_courses: {
    name: "Language Courses",
    parent: "education"
  },
  training: {
    name: "Training",
    parent: "training"
  },
  games_and_hobbies: {
    name: "Games & Hobbies"
  },
  automotive: {
    name: "Automotive",
    parent: "games_and_hobbies"
  },
  aviation: {
    name: "Aviation",
    parent: "games_and_hobbies"
  },
  hobbies: {
    name: "Hobbies",
    parent: "games_and_hobbies"
  },
  other_games: {
    name: "Other Games",
    parent: "games_and_hobbies"
  },
  video_games: {
    name: "Video Games",
    parent: "games_and_hobbies"
  },
  government_and_organizations: {
    name: "Government & Organizations"
  },
  local: {
    name: "Local",
    parent: "government_and_organizations"
  },
  national: {
    name: "National",
    parent: "government_and_organizations"
  },
  non_profit: {
    name: "Non-profit",
    parent: "government_and_organizations"
  },
  regional: {
    name: "Regional",
    parent: "government_and_organizations"
  },
  health: {
    name: "Health"
  },
  alternative_health: {
    name: "Alternative Health",
    parent: "health"
  },
  fitness_and_nutrition: {
    name: "Fitness & Nutrition",
    parent: "health"
  },
  self_help: {
    name: "Self-Help",
    parent: "health"
  },
  sexuality: {
    name: "Sexuality",
    parent: "health"
  },
  kids_and_family: {
    name: "Kids & Family"
  },
  music: {
    name: "Music"
  },
  news_and_politics: {
    name: "News & Politics"
  },
  religion_and_spirituality: {
    name: "Religion & Spirituality"
  },
  buddhism: {
    name: "Buddhism",
    parent: "religion_and_spirituality"
  },
  christianity: {
    name: "Christianity",
    parent: "religion_and_spirituality"
  },
  hinduism: {
    name: "Hinduism",
    parent: "religion_and_spirituality"
  },
  islam: {
    name: "Islam",
    parent: "religion_and_spirituality"
  },
  judaism: {
    name: "Judaism",
    parent: "religion_and_spirituality"
  },
  other: {
    name: "Other",
    parent: "religion_and_spirituality"
  },
  spirituality: {
    name: "Spirituality",
    parent: "religion_and_spirituality"
  },
  science_and_medicine: {
    name: "Science & Medicine"
  },
  medicine: {
    name: "Medicine",
    parent: "science_and_medicine"
  },
  natural_sciences: {
    name: "Natural Sciences",
    parent: "science_and_medicine"
  },
  social_sciences: {
    name: "Social Sciences",
    parent: "science_and_medicine"
  },
  society_and_culture: {
    name: "Society & Culture"
  },
  history: {
    name: "History",
    parent: "society_and_culture"
  },
  personal_journals: {
    name: "Personal Journals",
    parent: "society_and_culture"
  },
  philosophy: {
    name: "Philosophy",
    parent: "society_and_culture"
  },
  places_and_travel: {
    name: "Places & Travel",
    parent: "society_and_culture"
  },
  sports_and_recreation: {
    name: "Sports & Recreation"
  },
  amateur: {
    name: "Amateur",
    parent: "sports_and_recreation"
  },
  college_and_high_school: {
    name: "College & High School",
    parent: "sports_and_recreation"
  },
  outdoor: {
    name: "Outdoor",
    parent: "sports_and_recreation"
  },
  professional: {
    name: "Professional",
    parent: "sports_and_recreation"
  },
  technology: {
    name: "Technology"
  },
  gadgets: {
    name: "Gadgets",
    parent: "technology"
  },
  tech_news: {
    name: "Tech News",
    parent: "technology"
  },
  podcasting: {
    name: "Podcasting",
    parent: "technology"
  },
  software_how_to: {
    name: "Software How-To",
    parent: "technology"
  },
  tv_and_film: {
    name: "TV & Film"
  }
};

export function buildiTunesCategory(category_slug) {
  let result = {};

  if (iTunesCategories.hasOwnProperty(category_slug)) {
    const category = iTunesCategories[category_slug];
    result["itunes:category"] = {
      _attr: { text: category.name }
    };

    if (category.parent && iTunesCategories.hasOwnProperty(category.parent)) {
      const parent_category = iTunesCategories[category.parent];

      result = {
        "itunes:category": [
          {
            _attr: {
              text: parent_category.name
            }
          },
          result
        ]
      };
    }
  }

  return result;
}
