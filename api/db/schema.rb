# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_02_11_201054) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "authorizations", force: :cascade do |t|
    t.integer "user_id"
    t.string "subject_class"
    t.integer "subject_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "membership_id"
    t.bigint "client_id"
    t.index ["membership_id"], name: "index_authorizations_on_membership_id"
    t.index ["user_id"], name: "index_authorizations_on_user_id"
  end

  create_table "authorizations_scopes", force: :cascade do |t|
    t.bigint "authorization_id", null: false
    t.bigint "scope_id", null: false
    t.index ["authorization_id"], name: "index_authorizations_scopes_on_authorization_id"
    t.index ["scope_id"], name: "index_authorizations_scopes_on_scope_id"
  end

  create_table "client_accesses", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "account_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_id"], name: "index_client_accesses_on_client_id"
  end

  create_table "clients", force: :cascade do |t|
    t.string "name"
    t.string "uuid"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "company_name"
    t.string "contact_type"
    t.string "contact_name"
    t.string "contact_title"
    t.string "contact_phone"
    t.string "contact_fax"
    t.string "contact_email"
    t.string "mailing_address_1"
    t.string "mailing_address_2"
    t.string "mailing_city"
    t.string "mailing_state"
    t.string "mailing_zip"
    t.string "billing_address_1"
    t.string "billing_address_2"
    t.string "billing_city"
    t.string "billing_state"
    t.string "billing_zip"
    t.integer "parent_id"
    t.string "mailing_country"
    t.string "billing_country"
    t.boolean "default_template_enabled", default: false
    t.text "slogan"
    t.string "subdomain"
    t.text "client_text"
    t.string "closing"
    t.string "homepage"
  end

  create_table "domains", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_id"], name: "index_domains_on_client_id"
  end

  create_table "memberships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "client_id", null: false
    t.index ["client_id"], name: "index_memberships_on_client_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "project_accesses", force: :cascade do |t|
    t.string "account_id"
    t.integer "project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "project_number"
    t.integer "domain_id"
    t.string "project_type"
    t.string "account_id"
    t.date "modified_on"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "report_accesses", force: :cascade do |t|
    t.string "account_id"
    t.integer "report_id"
  end

  create_table "reports", force: :cascade do |t|
    t.string "name"
    t.string "url"
    t.text "description"
    t.integer "project_id"
    t.date "presented_on"
    t.date "modified_on"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "scopes", force: :cascade do |t|
    t.string "scope"
    t.string "action"
    t.text "description"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "global", default: false
    t.boolean "dynamic", default: false
    t.string "name"
  end

  create_table "scopes_users", id: false, force: :cascade do |t|
    t.bigint "scope_id"
    t.bigint "user_id"
    t.index ["scope_id"], name: "index_scopes_users_on_scope_id"
    t.index ["user_id"], name: "index_scopes_users_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "auth_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "company_name"
    t.string "contact_name"
    t.string "contact_title"
    t.string "contact_phone"
    t.string "contact_fax"
    t.string "contact_email"
    t.string "mailing_address_1"
    t.string "mailing_address_2"
    t.string "mailing_city"
    t.string "mailing_state"
    t.string "mailing_zip"
    t.string "mailing_country"
    t.string "password_reset_token"
    t.datetime "password_reset_expires_at"
    t.string "password_reset_domain"
    t.datetime "last_login"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "authorizations", "memberships"
  add_foreign_key "authorizations_scopes", "authorizations"
  add_foreign_key "authorizations_scopes", "scopes"
  add_foreign_key "client_accesses", "clients"
  add_foreign_key "domains", "clients"
  add_foreign_key "memberships", "clients"
  add_foreign_key "memberships", "users"
end
