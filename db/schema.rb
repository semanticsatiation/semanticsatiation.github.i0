# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_10_12_195638) do

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
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "activities", force: :cascade do |t|
    t.string "activitable_type"
    t.bigint "activitable_id"
    t.string "activity", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["activitable_type", "activitable_id"], name: "index_activities_on_activitable"
  end

  create_table "bug_contributers", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "bug_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bug_id", "user_id"], name: "index_bug_contributers_on_bug_id_and_user_id", unique: true
    t.index ["bug_id"], name: "index_bug_contributers_on_bug_id"
    t.index ["user_id"], name: "index_bug_contributers_on_user_id"
  end

  create_table "bugs", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.string "status", default: "new", null: false
    t.string "severity", default: "minor", null: false
    t.string "expected_result", null: false
    t.string "actual_result", null: false
    t.string "environment", null: false
    t.string "testing_version", null: false
    t.datetime "dead_line", null: false
    t.bigint "project_id"
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "steps", null: false
    t.string "platform", null: false
    t.string "url", null: false
    t.string "components", null: false
    t.string "priority", default: "low", null: false
    t.datetime "close_date"
    t.index ["priority"], name: "index_bugs_on_priority"
    t.index ["project_id"], name: "index_bugs_on_project_id"
    t.index ["severity"], name: "index_bugs_on_severity"
    t.index ["status"], name: "index_bugs_on_status"
    t.index ["title"], name: "index_bugs_on_title"
    t.index ["user_id"], name: "index_bugs_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.text "comment", null: false
    t.bigint "bug_id"
    t.bigint "user_id"
    t.bigint "parent_id"
    t.bigint "reply_comment_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bug_id"], name: "index_comments_on_bug_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "recipient_id", null: false
    t.integer "actor_id", null: false
    t.boolean "read", default: false
    t.text "context", default: "", null: false
    t.string "link"
    t.string "action"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "project_contributer_id"
    t.index ["project_contributer_id"], name: "index_notifications_on_project_contributer_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_organizations_on_name"
    t.index ["user_id"], name: "index_organizations_on_user_id"
  end

  create_table "project_contributers", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "project_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "contributed", default: false
    t.boolean "pending", default: true
    t.index ["created_at"], name: "index_project_contributers_on_created_at"
    t.index ["pending"], name: "index_project_contributers_on_pending"
    t.index ["project_id", "user_id"], name: "index_project_contributers_on_project_id_and_user_id", unique: true
    t.index ["project_id"], name: "index_project_contributers_on_project_id"
    t.index ["user_id"], name: "index_project_contributers_on_user_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name", null: false
    t.string "description", null: false
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "organization_id"
    t.index ["created_at"], name: "index_projects_on_created_at"
    t.index ["name"], name: "index_projects_on_name"
    t.index ["organization_id"], name: "index_projects_on_organization_id"
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "password_digest", null: false
    t.string "username", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "session_token", null: false
    t.text "biography", default: "", null: false
    t.string "theme", default: "Default", null: false
    t.index ["session_token"], name: "index_users_on_session_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "bug_contributers", "bugs"
  add_foreign_key "bug_contributers", "users"
  add_foreign_key "bugs", "projects"
  add_foreign_key "bugs", "users"
  add_foreign_key "comments", "bugs"
  add_foreign_key "comments", "users"
  add_foreign_key "notifications", "project_contributers"
  add_foreign_key "organizations", "users"
  add_foreign_key "project_contributers", "projects"
  add_foreign_key "project_contributers", "users"
  add_foreign_key "projects", "users"
end
