FactoryBot.define do
  factory :scope do
    trait :project do
      scope { 'project' }
    end

    trait :report do
      scope { 'report' }
    end

    trait :client do
      scope { 'client' }
    end

    trait :user do
      scope { 'user' }
    end

    trait :domain do
      scope { 'domain' }
    end

    trait :read do
      action { 'read' }
    end

    trait :create do
      action { 'create' }
    end

    trait :update do
      action { 'update' }
    end

    trait :destroy do
      action { 'destroy' }
    end

    trait :authorize do
      action { 'authorize' }
    end

    trait :authorized do
      action { 'authorized' }
    end

    trait :admin do
      action { 'admin' }
    end
  end
end
