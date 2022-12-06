module Projects
  class CreateProject
    include Interactor

    delegate :project, to: :context

    def call
      context.fail!(message: project.errors) unless project.save
    end

    def rollback
      project.destroy
    end
  end
end
