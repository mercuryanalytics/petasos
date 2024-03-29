FactoryBot.define do
  factory :project do
    name { Faker::Name.name }
    description { Faker::Lorem.paragraph(sentence_count: 10) }
    project_number { Faker::Alphanumeric.alphanumeric(number: 10) }
    project_type { "Media/Message Test" }
    association :client
  end
end
