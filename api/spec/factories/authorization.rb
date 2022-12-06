FactoryBot.define do
  factory :authorization do

    factory :client_auth do
      subject_class { 'Client' }
    end

    factory :project_auth do
      subject_class { 'Project' }
    end

    factory :report_auth do
      subject_class { 'Report' }
    end
  end
end
