DROP INDEX `groups_name_unique`;--> statement-breakpoint
ALTER TABLE `groups` ADD `user_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `groups_name_user_unique` ON `groups` (`name`,`user_id`);--> statement-breakpoint
DROP INDEX `urls_url_unique`;--> statement-breakpoint
ALTER TABLE `urls` ADD `user_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `urls_url_user_unique` ON `urls` (`url`,`user_id`);