# frozen_string_literal: true

namespace :git do
  task :create_release do
    on release_roles(:all) do
      with fetch(:git_environmental_variables) do
        within repo_path do
          execute :git, :archive, fetch(:branch),
                  "api", "|", "tar", "-x", "--strip-components=1", "-f", "-", "-C", release_path
        end
      end
    end
  end
end
