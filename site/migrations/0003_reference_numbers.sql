-- Reference numbers are the inquiry id, shown to the buyer and in the sales email. They start at 205602 so the
-- site does not look new: the counter is set to 205601, so the next inquiry gets 205602. (Inquiry 1, sent while
-- testing on 2026-11-09, keeps its number.) Test inquiries use up numbers too; that is fine.
DELETE FROM sqlite_sequence WHERE name = 'inquiries';
INSERT INTO sqlite_sequence (name, seq) VALUES ('inquiries', 205601);
