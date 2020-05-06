FactoryBot.define do
  factory :client do
    name { Faker::Name.name }
    uuid { SecureRandom.uuid }
  end
end
