module Projects
  class ValidateProject
    include Interactor

    delegate :params, to: :context

    def call
      project = context.project || Project.new
      project.assign_attributes(params)

      project.valid? ? context.project = project : context.fail!(message: project.errors)
    end
  end
end
