class AddOrganizationForeignKeyToProjects < ActiveRecord::Migration[5.2]
  def change
    add_reference :projects, :organization, index: true
  end
end
