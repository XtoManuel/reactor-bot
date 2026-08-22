Reactor™
========

.. image:: https://img.shields.io/travis/iomintz/reactor-bot/master.svg?label=tests
	:target: https://travis-ci.org/iomintz/reactor-bot
	:alt: Unit Test Status

.. image:: https://coveralls.io/repos/github/iomintz/reactor-bot/badge.svg
	:target: https://coveralls.io/github/iomintz/reactor-bot
	:alt: Coverage Status

.. image:: https://discordbots.org/api/widget/status/323505480766849026.svg?noavatar=true
	:target: https://discordbots.org/bot/323505480766849026
	:alt: Discord Bots List

The best dang Discord poll bot around™

Usage
-----

::

	/ Is F# better than Python?

*The bot will add 👍, 👎, and 🤷 (shrug) as reactions* ::

	/ Where should we go for pizza?
	A Domino's
	B Papa John's (papa bless)
	C Giordano's

*The bot will add 🇦, 🇧, 🇨, and 🤷 as reactions*
(You can also use numbers, but not 1234 or 10 for technical reasons)

You can also use right-parens and other emoji ::

	/ How should I punctuate whomstve?
	🤔) whomst've
	:thonking:) whom'st've
	🅱️) w'h'o'm's't've


*🤔, \:thonking\: (if your server has it), 🅱️, and 🤷 will be added as reactions*


If you have a certain channel for which every message should be a poll,
you can use the command: /commandless. It works like this:

:code:`/commandless #channel-here yes/no`

If yes (or 1 or true), every message sent in that channel will be treated as a poll.
You need the "manage roles" permission to change this setting.


Installation
------------

Run this in :code:`psql`::

	CREATE USER reactor;
	\password reactor
	CREATE DATABASE reactor WITH OWNER reactor;

And then copy data/config.example.json to data/config.json and fill out the appropriate values
in the database section and all the other sections.

Next, install the database schema: :code:`psql reactor -f data/schema.sql`.

Now just :code:`pip install -e .`, preferably inside a venv.
And finally, to run the bot, you do :code:`python -m reactor_bot`.

Compatibility
-------------

Python3.6+

License
-------

MIT. See `COPYING </COPYING>`_.
