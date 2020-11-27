# calculate-my-odds

Work in progress.

## TODO-list

* Add option to enter quantity for items on tables.
* Add option to enter values for items and have conditions based on total value.
* Add support for conditional rolls on tables.
* Add more options for the goals (e.g. conditions based on iterations).
* Add a "Calculate average" calculation method.
* Add an automatic option to calculation methods which chooses the option that fits the user input the best.
* Fix all floating point precision issues (many of them are in TODO comments already).
* Write a bunch of tests for the calculator and simulator.
* Make the UI more intuitive (add header, add instructions, fix inconsistent wording, etc).
* Consider optimizing the speed of the calculator and simulator.
* Go through all the TODOs in the code.
* Maybe some more stuff I've forgotten.

Other considerations for the future:

* Add templates for common use cases.
* Add options to easily save and/or share a set of tables and goals.
* Add an option to show the non-cumulative success rate in the results.
* Add option for higher precision results for the calculator.
* Add more options for memorizing rolls (e.g. keep only last roll to simulate dices).
* Allow more complex expressions as input for goal and roll conditions (e.g. arithmetic, count the most commonly rolled item).
* Allow user to write scripts for cases which the calculator does not handle. However preferably the calculator should handle as much as possible on its own.