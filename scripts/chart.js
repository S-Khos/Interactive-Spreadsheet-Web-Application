// YOUR CODE GOES HERE

function getGrade(mark) {
    if (mark < 5.0) {
        return 'F';
    } else if (mark < 6.0) {
        return 'D';
    } else if (mark < 7.0) {
        return 'C';
    } else if (mark < 8.0) {
        return 'B';
    } else {
        return 'A';
    }
}
