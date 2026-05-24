ALTER TABLE `urls` ADD `group_id` text REFERENCES groups(id);--> statement-breakpoint
CREATE UNIQUE INDEX `groups_name_unique` ON `groups` (`name`);