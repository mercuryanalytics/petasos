FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    auth_id { 'auth0|5e43e382c452940d9fce740f' }
    # association :client
  end
end
