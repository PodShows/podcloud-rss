// polyfill
import 'isomorphic-fetch'

import express from 'express';
import ApolloClient, { createNetworkInterface, IntrospectionFragmentMatcher } from 'apollo-client';
import gql from 'graphql-tag';
import RSS from 'rss';

const notEmpty = function(obj) {
    return (typeof obj === "string" && obj.length > 0);
}

const iTunesCategories = {
   "arts":{
      "name":"Arts"
   },
   "design":{
      "name":"Design",
      "parent":"arts"
   },
   "fashion_and_beauty":{
      "name":"Fashion & Beauty",
      "parent":"arts"
   },
   "food":{
      "name":"Food",
      "parent":"arts"
   },
   "literature":{
      "name":"Literature",
      "parent":"arts"
   },
   "performing_arts":{
      "name":"Performing Arts",
      "parent":"arts"
   },
   "visual_arts":{
      "name":"Visual Arts",
      "parent":"arts"
   },
   "business":{
      "name":"Business"
   },
   "business_news":{
      "name":"Business News",
      "parent":"business"
   },
   "careers":{
      "name":"Careers",
      "parent":"business"
   },
   "investing":{
      "name":"Investing",
      "parent":"business"
   },
   "management_and_marketing":{
      "name":"Management & Marketing",
      "parent":"business"
   },
   "shopping":{
      "name":"Shopping",
      "parent":"business"
   },
   "comedy":{
       "name":"Comedy"
   },
   "education":{
      "name":"Education"
   },
   "education_subcategory":{
      "name":"Education",
      "parent":"education"
   },
   "education_technology":{
      "name":"Education Technology",
      "parent":"education"
   },
   "higher_education":{
      "name":"Higher Education",
      "parent":"education"
   },
   "k_12":{
      "name":"K-12",
      "parent":"education"
   },
   "language_courses":{
      "name":"Language Courses",
      "parent":"education"
   },
   "training":{
      "name":"Training",
      "parent":"training"
   },
   "games_and_hobbies":{
      "name":"Games & Hobbies"
   },
   "automotive":{
      "name":"Automotive",
      "parent":"games_and_hobbies"
   },
   "aviation":{
      "name":"Aviation",
      "parent":"games_and_hobbies"
   },
   "hobbies":{
      "name":"Hobbies",
      "parent":"games_and_hobbies"
   },
   "other_games":{
      "name":"Other Games",
      "parent":"games_and_hobbies"
   },
   "video_games":{
      "name":"Video Games",
      "parent":"games_and_hobbies"
   },
   "government_and_organizations":{
      "name":"Government & Organizations"
   },
   "local":{
      "name":"Local",
      "parent":"government_and_organizations"
   },
   "national":{
      "name":"National",
      "parent":"government_and_organizations"
   },
   "non_profit":{
      "name":"Non-profit",
      "parent":"government_and_organizations"
   },
   "regional":{
      "name":"Regional",
      "parent":"government_and_organizations"
   },
   "health":{
      "name":"Health"
   },
   "alternative_health":{
      "name":"Alternative Health",
      "parent":"health"
   },
   "fitness_and_nutrition":{
      "name":"Fitness & Nutrition",
      "parent":"health"
   },
   "self_help":{
      "name":"Self-Help",
      "parent":"health"
   },
   "sexuality":{
      "name":"Sexuality",
      "parent":"health"
   },
   "kids_and_family":{
      "name":"Kids & Family"
   },
   "music":{
      "name":"Music"
   },
   "news_and_politics":{
      "name":"News & Politics"
   },
   "religion_and_spirituality":{
      "name":"Religion & Spirituality"
   },
   "buddhism":{
      "name":"Buddhism",
      "parent":"religion_and_spirituality"
   },
   "christianity":{
      "name":"Christianity",
      "parent":"religion_and_spirituality"
   },
   "hinduism":{
      "name":"Hinduism",
      "parent":"religion_and_spirituality"
   },
   "islam":{
      "name":"Islam",
      "parent":"religion_and_spirituality"
   },
   "judaism":{
      "name":"Judaism",
      "parent":"religion_and_spirituality"
   },
   "other":{
      "name":"Other",
      "parent":"religion_and_spirituality"
   },
   "spirituality":{
      "name":"Spirituality",
      "parent":"religion_and_spirituality"
   },
   "science_and_medicine":{
      "name":"Science & Medicine"
   },
   "medicine":{
      "name":"Medicine",
      "parent":"science_and_medicine"
   },
   "natural_sciences":{
      "name":"Natural Sciences",
      "parent":"science_and_medicine"
   },
   "social_sciences":{
      "name":"Social Sciences",
      "parent":"science_and_medicine"
   },
   "society_and_culture":{
      "name":"Society & Culture"
   },
   "history":{
      "name":"History",
      "parent":"society_and_culture"
   },
   "personal_journals":{
      "name":"Personal Journals",
      "parent":"society_and_culture"
   },
   "philosophy":{
      "name":"Philosophy",
      "parent":"society_and_culture"
   },
   "places_and_travel":{
      "name":"Places & Travel",
      "parent":"society_and_culture"
   },
   "sports_and_recreation":{
      "name":"Sports & Recreation"
   },
   "amateur":{
      "name":"Amateur",
      "parent":"sports_and_recreation"
   },
   "college_and_high_school":{
      "name":"College & High School",
      "parent":"sports_and_recreation"
   },
   "outdoor":{
      "name":"Outdoor",
      "parent":"sports_and_recreation"
   },
   "professional":{
      "name":"Professional",
      "parent":"sports_and_recreation"
   },
   "technology":{
      "name":"Technology"
   },
   "gadgets":{
      "name":"Gadgets",
      "parent":"technology"
   },
   "tech_news":{
      "name":"Tech News",
      "parent":"technology"
   },
   "podcasting":{
      "name":"Podcasting",
      "parent":"technology"
   },
   "software_how_to":{
      "name":"Software How-To",
      "parent":"technology"
   },
   "tv_and_film":{
      "name":"TV & Film"
   }
};

const buildiTunesCategory = function(itunes_category) {
    let result = {}
    
    if(iTunesCategories.hasOwnProperty(itunes_category)) {
        const category = iTunesCategories[itunes_category];
        result["itunes:category"] = {
            _attr: { text: category.name }
        };

        if(category.parent && iTunesCategories.hasOwnProperty(category.parent)) {
            const parent_category = iTunesCategories[category.parent];
            
            result = {
                "itunes:category": [
                    { _attr: {
                        text: parent_category.name
                    } },
                    result
                ]
            };
        }
    }
    
    return result;
};

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: {
        __schema: {
            types: [
                {
                    kind: "INTERFACE",
                    name: "PodcastItem",
                    possibleTypes: [
                        { name: "Episode" },
                        { name: "Post" }
                    ]
                }
            ]
        }
    }
});

const client = new ApolloClient({
    networkInterface: createNetworkInterface({
        uri: 'http://localhost:8880/graphql'
    }),
    fragmentMatcher
});

const PORT = 8881;

var app = express();

app.get('/', function (req, res) {
    res.redirect("https://podcloud.fr/")
});

app.get("/:identifier\.:ext?", function (req, res){
    const format = req.params.ext || "rss"
    const identifier = req.params.identifier

    client.query({
        query: gql`
        query getFeed ($identifier: String!) {
            podcastWithIdentifier(identifier: $identifier) {
                title
                description
                catchline
                feed_url
                cover_url
                website_url
                language
                contact_email
                author
                explicit
                tags
                itunes_block
                itunes_category
                feed_redirect_url
                copyright
                updated_at
                items {
                    title
                    author
                    guid
                    text_content
                    formatted_content
                    published_at
                    url
                    explicit
                    ... on Episode {
                        cover_url
                        enclosure {
                            url
                            type
                            size
                            duration
                        }
                    }
                }
            }
        }
        `,
        variables: {
            identifier
        },
        operationName: 'getFeed'
    }).then(graph_res => {
        console.log(graph_res);
        let fdata = graph_res.data.podcastWithIdentifier;

        if(fdata == null) {
            res.send("Not found");
        } else {
            let rss_feed = {
                title: fdata.title,
                description: fdata.description,
                site_url: fdata.website_url,
                feed_url: fdata.feed_url,
                image_url: fdata.cover_url,
                language: fdata.language,
                copyright: fdata.copyright,
                pubDate: fdata.updated_at,
                generator: "podcloud-rss 1.0.0",
                custom_namespaces: {
                    'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
                },
                custom_elements: [
                    {"itunes:summary": { _cdata: fdata.description.substring(0,3950) } },
                    { "itunes:subtitle": { _cdata: fdata.catchline.substring(0, 255) } },
                    { "itunes:explicit": fdata.explicit ? "yes" : "no" },
                    { "itunes:keywords": fdata.tags.concat(["podCloud"]).join(", ") },
                    { "itunes:author": notEmpty(fdata.author) ? fdata.author : "Anonyme" },
                    { "itunes:image": { "_attr": { "href": fdata.cover_url } } }
                ]
            };

            if(notEmpty(fdata.contact_email)) {
                let webmaster = fdata.contact_email;

                let itunesOwner = []

                if(notEmpty(fdata.author)) {
                    webmaster += " ("+fdata.author+")";
                    itunesOwner.push(
                        { "itunes:name": fdata.author }
                    );
                }
                        
                rss_feed.webMaster = webmaster;
                itunesOwner.push(
                    { "itunes:email": fdata.contact_email }
                );                
                rss_feed.custom_elements.push(
                    {"itunes:owner": itunesOwner}
                );
            }
            
            if(fdata.block_itunes) {
                rss_feed.custom_elements.push(
                    { "itunes:block": "yes" }
                );
            }

            if (fdata.itunes_category) {
                rss_feed.custom_elements.push(
                    buildiTunesCategory(fdata.itunes_category)
                );
            }
            
            if (fdata.disabled) {
                rss_feed.custom_elements.push(
                    { "itunes:new-feed-url": fdata.feed_redirect_url }
                );
            }
            
            let feed = new RSS(rss_feed);

            if (!fdata.disabled) {
                fdata.items.forEach(item => {
                    let rss_item = {
                        title: item.title,
                        guid: item.guid,
                        url: item.url,
                        date: item.published_at,
                        description: item.formatted_content
                    };

                    const has_enclosure = (typeof item.enclosure === "object");

                    if(has_enclosure) {
                        let chronic_duration = "";
                        let seconds = item.enclosure.duration;
                        let hours = Math.floor(seconds/3600);
                        console.log(seconds);
                        console.log(hours);
                        seconds = seconds - hours*3600;
                        let minutes = Math.floor(seconds/60);
                        console.log(minutes);
                        seconds = seconds - minutes*60;

                        console.log(seconds);
                        chronic_duration = (hours+":"+("00"+minutes).slice(-2)+":"+("00"+seconds).slice(-2));
                        
                        rss_item.custom_elements = [
                            { "itunes:image": {
                                _attr: {
                                    href: item.cover_url
                                }
                            } },
                            { "itunes:summary": item.text_content.substring(0, 3999) },
                            { "itunes:summary": item.text_content.substring(0, 255) },
                            { "itunes:duration": chronic_duration }
                        ];

                        rss_item.enclosure = item.enclosure;
                    }

                    if(notEmpty(item.author)) {
                        rss_item.author = item.author;
                        if(has_enclosure) {
                            rss_item.custom_elements.push(
                                      {"itunes:author": item.author}
                            );
                        }
                    }

                    feed.item(rss_item);
                });
            }

            res.send(feed.xml({indent: true}));
        }
    }).catch(error => {
        console.error(error);
        res.send(error);
    });
});

app.listen(PORT, () => console.log(
    `RSS server is now running on http://localhost:${PORT}/`
));
