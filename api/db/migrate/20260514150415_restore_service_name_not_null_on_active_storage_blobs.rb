# Completes the deferred portion of the Rails-shipped
# AddServiceNameToActiveStorageBlobs migration (commit 8381961). Runs after
# the production app cuts over to Rails 6.1, so the legacy Rails 6.0 app is
# no longer inserting NULL service_name rows into the shared database.
class RestoreServiceNameNotNullOnActiveStorageBlobs < ActiveRecord::Migration[6.1]
  def up
    return unless table_exists?(:active_storage_blobs)
    return unless column_exists?(:active_storage_blobs, :service_name)

    configured_service = ActiveStorage::Blob.service.name
    ActiveStorage::Blob.unscoped.where(service_name: nil).update_all(service_name: configured_service)

    change_column_null :active_storage_blobs, :service_name, false
  end

  def down
    return unless table_exists?(:active_storage_blobs)
    return unless column_exists?(:active_storage_blobs, :service_name)

    change_column_null :active_storage_blobs, :service_name, true
  end
end
