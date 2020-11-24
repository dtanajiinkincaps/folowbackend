SELECT u.person_name AS name
	,u.username
	,u.profile_image
	,post.post_id
	,post.description
	,post.location
	,post.post_type
	,TO_CHAR(post.post_timing, 'DD/MM/YYYY HH24:MI:ss') indian_time
	,TO_CHAR(post.post_utc_timing, 'DD/MM/YYYY HH24:MI:ss') utc_time
	(
		SELECT COALESCE(array_to_json(array_agg(post_media)), '[]')
		FROM (
			SELECT post_media.media ->> 'seq' AS seq
				,post_media.media ->> 'name' AS name
				,post_media.media ->> 'type' AS type
				,post_media.media ->> 'location' AS location
				,(
					SELECT COALESCE(array_to_json(array_agg(post_like)), '[]')
					FROM (
						SELECT likes.like_action
							,count(*) total_likes
							,(
								SELECT COALESCE(array_to_json(array_agg(post_like)), '[]')
								FROM (
									SELECT u.username
										,u.person_name AS name
										,u.profile_image
										,likes.like_action
									FROM post_likes u_likes
										,users u
									WHERE u.auth_token = u_likes.auth_token
										AND u_likes.post_id = post_media.post_id
										AND u_likes.like_type = post_media.media ->> 'type'
										AND u_likes.post_name = post_media.media ->> 'name'
										AND u_likes.like_action = likes.like_action
									) post_like
								) liked_by
						FROM post_likes likes
							,users u
						WHERE u.auth_token = likes.auth_token
							AND likes.post_id = post_media.post_id
							AND likes.like_type = post_media.media ->> 'type'
							AND likes.post_name = post_media.media ->> 'name'
						GROUP BY likes.post_id
							,likes.like_type
							,likes.post_name
							,likes.like_action
						) post_like
					) likes
				,(
					SELECT count(*)
					FROM post_likes likes
						,users u
					WHERE u.auth_token = likes.auth_token
						AND likes.post_id = post_media.post_id
						AND likes.like_type = post_media.media ->> 'type'
						AND likes.post_name = post_media.media ->> 'name'
						AND likes.auth_token = '"+data.auth_token+"'
					) liked_by_you
				,(
					SELECT COALESCE(array_to_json(array_agg(post_comment)), '[]')
					FROM (
						SELECT comments.comment_id
							,u.username
							,u.person_name AS name
							,u.profile_image
							,comments.comment
							,(
								SELECT COALESCE(array_to_json(array_agg(post_comment)), '[]')
								FROM (
									SELECT comm.comment_id
										,u.username
										,u.person_name AS name
										,u.profile_image
										,comments.comment
										,comm.comment_level
									FROM post_comments comm
										,users u
									WHERE comm.auth_token = u.auth_token
										AND comm.post_id = comments.post_id
										AND comm.post_name = comments.post_name
										AND comm.comment_type = 'reply'
									ORDER BY comm.comment_level
									) post_comment
								) comment_replies
						FROM post_comments comments
							,users u
						WHERE u.auth_token = comments.auth_token
							AND comments.post_id = post_media.post_id
							AND comments.comment_type = post_media.media ->> 'type'
							AND comments.post_name = post_media.media ->> 'name'
						) post_comment
					) commented_by
				,(
					SELECT count(*)
					FROM post_comments comments
						,users u
					WHERE u.auth_token = comments.auth_token
						AND comments.post_id = post_media.post_id
						AND comments.comment_type = post_media.media ->> 'type'
						AND comments.post_name = post_media.media ->> 'name'
					) total_comments
			FROM (
				SELECT post_id
					,jsonb_array_elements(media) AS media
				FROM posts
				WHERE post_id = post.post_id
				) post_media
			) post_media
		) as media
	,post.comments
	,post.likes total_likes
	,post.comments total_comments
	,(
		SELECT count(*)
		FROM post_likes
		WHERE post_id = post.post_id
			AND like_type = 'post'
			AND auth_token = '"+data.auth_token+"'
		) liked_by_you
	,COALESCE(hashtags, '') hashtags
	,COALESCE(mentions, '') mentions
	,(post.auth_token = '"+data.auth_token+"') AS is_self
FROM posts post
	,users u
WHERE post.auth_token = u.auth_token
	AND "+condition+"
ORDER BY post.post_id DESC
