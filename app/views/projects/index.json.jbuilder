json.byId do
    @projects.each do |project|
        json.set! project.id do
            json.partial! "/projects/project", project: project
            if @is_project_contributed
                json.joinDate project.join_date
            end
        end
    end
end


if @upcoming_projects || @recalibrate
    remaining_to_be_sort_by = @to_be_sorted - @projects.map(&:id)

    json.allIds(@all_current_project_ids + @projects.map(&:id) + remaining_to_be_sort_by)

    json.toBeSorted(remaining_to_be_sort_by)
else
    json.allIds @projects.map(&:id)
end



# .size determines when to use length or count when counting objects (usually correct)
# using count is for when we still haven't gotten projects of an organization
# if projects were already fetched, we would use length since there is already an array present
# and we wouldn't want to make more queries
json.totalProjects @all_projects_count