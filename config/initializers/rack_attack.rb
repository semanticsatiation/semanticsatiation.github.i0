class Rack::Attack
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.throttled_response_retry_after_header = true

    # custom JSON message response when user is throttled
    self.throttled_response = -> (env) {
        retry_after = (env['rack.attack.match_data'] || {})[:period]
        [
            500,
            {'Content-Type' => 'application/json', 'Retry-After' => retry_after.to_s},
            [["Relax retry in #{retry_after.to_s} seconds"].to_json]
        ]
    }

    # throttle(unique_name, how_many_requests_allowed, within_amount_of_time )

    # How do I throttle a potential user if i do not possess a unique id for them???
    # gotta see if Rack::Attack has other options!!!
    # throttle('sign_up', limit: 1, period: 5.seconds) do |req|
    #     if req.path == "/api/users" && req.post?
    #         req.params["user"]["username"].presence
    #     end
    # end

    # throttle('log_in', limit: 1, period: 5.seconds) do |req|
    #     if req.path == "/api/session" && req.post?
    #         # return the username if present, nil otherwise (.presence)
    #         req.params["user"]["username"].presence
    #     end
    # end

    # HOW DO I THROTTLE PHOTO SEPARATELY FROM OTHER FIELDS?????
    # ESPECIALLY SINCE photo params IS NOT IN JSON FORMAT BUT THE OTHER FIELDS ARE (username, biography, etc...)

    # PHOTO CAN'T BE CONTINUED UNTIL WE FIGURE OUT HOW TO SEPARATE PHOTO THROTTLING FROM OTHER FIELDS
    # throttle('updating_user_photo', limit: 1, period: 60.seconds) do |req|
    #     if req.path.include?("/api/users/") && req.patch?
            
    #         # return the id if present, nil otherwise (.presence)
    #         req.params['user']['id'].presence
    #     end
    # end

    # do i need to always pass the user name in each model they update???
    # i should then look for the user id in each validate object with user_id
    # throttle('updating_user', limit: 1, period: 10.seconds) do |req|
    #     if req.path.include?("/api/users/") && req.patch?
    #         # return the id if present, nil otherwise (.presence)
    #         JSON.parse(req.body.string)['user']['id'].presence
    #     end
    # end
end
