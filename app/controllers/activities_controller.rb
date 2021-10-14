class ActivitiesController < ApplicationController
    before_action do
        must_be_a_project_worker!(params[:project_id])
    end

    before_action :set_project

    def index
        if params.has_key?(:project_activity)
            if params.has_key?(:month_off_set)
                @filtered_activities = @project.activities.select(:id, :created_at, :activity).where('extract(year from created_at) = ? and extract(month from created_at) = ?', month_offset[:year].to_i, Date::MONTHNAMES.index(month_offset[:month]))

                # count(:all) works where .count doesn't but idk why
                @all_month_activities_count = @filtered_activities.count(:all)

                @filtered_activities = @filtered_activities.order(created_at: :desc).limit(8).offset(8 * month_offset[:page].to_i)

                render :index
            else
                filtered_activities = @project.activities.select(:id, :created_at, :activity)

                hide_months_years = Hash.new { |h, k| h[k] = Hash.new(&h.default_proc) }
                year_month_hash = Hash.new { |h, k| h[k] = Hash.new(&h.default_proc) }

                sort_by_year_and_month = filtered_activities.group_by{|activity| activity.created_at.year}

                all_years_length = sort_by_year_and_month.count

                selected_keys = sort_by_year_and_month.keys.sort.reverse[(off_set * 10)..((off_set * 10) + 9)]

                sort_by_year_and_month = sort_by_year_and_month.select{|key| selected_keys.include?(key)}

                sort_by_year_and_month.keys.each do |year|
                    hide_months_years[year]["isHidden"] = true

                    sorted_year_activities = sort_by_year_and_month[year].sort{ |a,b| b.created_at <=> a.created_at}

                    group_act_by_months = sorted_year_activities.group_by{|activity| Date::MONTHNAMES[activity.created_at.month]}

                    group_act_by_months.keys.each do |month|
                        limit_activities = group_act_by_months[month].first(8)

                        limit_activities.each do |activity|
                            year_month_hash[year][month][activity.id] = activity
                        end

                        hide_months_years[year][month]["isHidden"] = true

                        year_month_hash[year][month]["totalActivities"] = group_act_by_months[month].count
                        year_month_hash[year][month]["allIds"] = limit_activities.map(&:id)
                    end

                    year_month_hash[year]["allIds"] = group_act_by_months.keys.sort_by{|month_number| Date::MONTHNAMES.index(month_number)}.reverse
                end

                render json: {byId: year_month_hash, allIds: sort_by_year_and_month.keys.sort_by(&:to_i).reverse, totalYears: all_years_length, hideMonthsYears: hide_months_years}
            end
        elsif params.has_key?(:bug_activity)
            @filtered_activities = @project.bugs.find(params[:bug_id]).activities.select(:id, :created_at, :activity)

            # count(:all) works where .count doesn't but idk why
            @all_bug_activities_count = @filtered_activities.count(:all)

            @filtered_activities = @filtered_activities.order(created_at: :desc).limit(10).offset(10 * off_set)

            render :index
        else
            render json: {}, status: 404
        end
    end
private
    def month_offset
        params[:month_off_set]
    end
end