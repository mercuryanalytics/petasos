# frozen_string_literal: true

module Projects
  class RemoveProject
    include Interactor

    delegate :project, to: :context

    def call
      context.fail!(message: project.errors) unless project.destroy
    end
  end
end
