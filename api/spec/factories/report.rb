FactoryBot.define do
  factory :report do
    name { Faker::Name.name }
    description { Faker::Lorem.paragraph(sentence_count: 10) }
    url { Faker::Internet.domain_name }
  end
end
