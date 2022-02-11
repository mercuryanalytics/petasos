class RenameProjectTypes < ActiveRecord::Migration[6.0]
  def change
    Project
      .where(project_type: ["Commercial Test", "Messaging Test", "Print Ad Test", "Trailer Test", "Video Test"])
      .update_all(project_type: "Media/Message Test")

    Project
      .where(project_type: ["Consumer Test", "Cover Test", "Website Evaluation Test", "Custom Test"])
      .update_all(project_type: "Custom Research")

    Project
      .where(project_type: ["Political Ad Test"])
      .update_all(project_type: "Political Research")
  end
end
