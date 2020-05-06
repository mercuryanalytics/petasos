module Projects
  class RemoveProject
    include Interactor

    delegate :project, to: :context

    def call
      project.destroy
    end
  end
end
