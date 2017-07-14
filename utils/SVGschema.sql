CREATE TABLE SVGhornpipes (
    id int NOT NULL AUTO_INCREMENT,
    tuneID int,
    svg text,
    PRIMARY KEY (id),
    FOREIGN KEY (tuneID) REFERENCES hornpipes(id)
);
