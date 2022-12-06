module Projects
  class UpdateProject
    include Interactor

    delegate :project, to: :context

    def call
      context.fail!(message: project.errors) unless project.save
    end
  end
end
