**Status: DEV**

Declarative Core-Composed System Orchestration Template
=======================================================

[![Join the chat at https://gitter.im/0system/0system.0](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/0system/0system.0?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An opinionated [ccjson](https://github.com/LogicCores/ccjson) based minimal primitive-component-based development and runtime system template for declarative JavaScript front- and NodeJS back-ends that deploys and automatically tests itself.

> Create stable static assets for deployment from your dynamic source logic.

[http://ZeroSystem.io/](http://zerosystem.io/)

[![Build Status](https://circleci.com/gh/LogicCores/0.svg?style=svg)](https://circleci.com/gh/LogicCores/0)


User support/patches chat: [![Chat](https://badges.gitter.im/gitterHQ/services.png)](https://gitter.im/0system/0system.0)

Internal development chat: [![Chat](https://badges.gitter.im/gitterHQ/services.png)](https://gitter.im/LogicCores/0)


Typical Setup
-------------

In most cases you will be using Zero System via the [0.workspace](https://github.com/LogicCores/0.workspace) project. It facilitates linking Zero System into a project repository in a non-intrusive way and provides lifecycle features to update to new versions.

We **strongly encourage** you to **NOT put your code into this repository directly** and instead use [0.workspace](https://github.com/LogicCores/0.workspace). Only when you outgrow `0.workspace` will you need to locate bigger chunks of code into this repository.

If you do need to make changes to this repository or any of its submodules we encourage you to work against [github.com/0system/0system.0](https://github.com/0system/0system.0) (which is automatically derived from this codebase) **instead** of this repository as `0system.0` inlines all submodules and is intended to facilitate contributions via a large single-layer clone network.

**All information below still applies when using Zero System via `0.workspace`** as `0.workspace` simply installs Zero System into a project at which point you interact with this Zero System codebase or a derivative thereof directly.


Commands
========

	git clone https://github.com/0system/0system.0
	cd 0system.0
	# or
	git clone https://github.com/LogicCores/0.git
	cd 0

	# One-time install
	npm install

	# Options
	npm run <script> --verbose   # Run in verbose mode

	# Development
	npm run update               # Pull changes, checkout submodules and re-install
	npm run edit                 # Launch an editor
	npm run dev                  # Run system in development mode using development profile
	npm run dev --production     # Run system in production mode using production profile
                                 # Run system in development mode using custom profile overlay
	npm run dev -- --profile ./Deployments/<name>.proto.profile.ccjson
	npm run encrypt              # Encrypt raw profile data using workspace secret
	npm test                     # Run whole system test suite

	# Put the root context of your system into your environment
	source scripts/activate.sh

	# Production
	npm start                    # Run system in production mode using production profile

	# Deploy
	npm run bundle               # Freeze everything for consistent distribution
	npm run deploy               # Deploy latest commit to staging
	npm run deploy --production  # Deploy latest commit to production
	npm run publish              # Publish latest commit


Clone and use as Template
=========================

## Namespaces

Zero System is based on *namespaces* where all components have their own namespace. Components are assembled into larger namespaces that form applications and systems. There are two primary categories of namespaces relevant to discuss here:

  * **External Namespaces** are namespaces that are exposed to external users of your system. These namespaces must be globally unique so anyone may consume your assets. Globally unique namespaces are derived from a **Hostname** that **you control**.
  * **Internal Namespaces** are namespaces used internally for directories and component prefixes among other uses and mapped to external namespaces. You can use one namespace to do a bunch of work internally and then serve it via another namespace. This is how features can be *subclassed across clones* and this is how you can get your system up and running fast by simply modifying the Zero System template.

### Constructing your own namespaces

Given a hostname such as `test.com` and a project you want to locate at `app.test.com` you may use the following namespaces:

  * External
    * Hostname: `app.test.com`
    * Root Namespace: `com.test.app`
    * Source Code Project Name: `com.test.app` (e.g. Github repository name)

  * Internal
    * Root Namespace: `com.test.app`
    * Namespace Directory: `com.test.app`

Notes:

  * You can safely *prefix* or *suffix* respectively (to narrow the context) the above without breaking the namespacing rules and conflicting with others.
  * You can safely *modify* the internal namespace if you don't plan on sharing your code publicly or if you want to reflect your own top-level namespace you are commanding and expect others to use. If you choose to do the latter you can modify the external namespace as well.
  * **NOTE:** The `0.*` external and internal namespace is **RESERVED for official clones** belonging to the `0` ecosystem as curated by [Christoph Dorn](http://christophdorn.com/). You can use (overlay) the `0.*` namespace for your own purposes, just keep in mind that it may conflict with official clones by the `0` community in future. This means you will be choosing to become incompatible with a future community unless your clone is the one that becomes official (something you should not bet on).

## Instructions

  1. Fork [github.com/0system/0system.0](https://github.com/0system/0system.0) and rename it to something `<ReverseHostname>.*` where `<ReverseHostname>` is a hostname **you have control over**. This is your *root external namespace* and will ensure your clone will never conflict with other cloens you have nor with anyone else's (see *Constructing your own namespaces* above). [0.workspace](https://github.com/LogicCores/0.workspace) does this for you.
  2. Develop your application in your chosen internal `<ReverseHostname>.*` namespace *in parallel* to the internal `0.*` namespace.
  3. Use the `0.*` application as a reference and to contribute back.
  4. Exclude the public `0.*` namespace when distributing your application (will happen by default).
  5. Let us know how you fare; good or bad so we can improve the process.


FAQ
===

### What is the scope of this project?

We are focusing on creating stable models for declarative development of distributed systems by validating them with minimal implementation in the form of a unified system template containig generic interface modules with adapters to popular domain-specific tool implementations.

The idea is that this system template is cloned many times and the systems built with it can provide feedback to refine the primitives that are needed as a foundation for all.

This project strictly focuses on minimal code and implementing *one* variation of each *core* along with adapters using **NodeJS** as a backend and any **JavaScript** runtime as a front-end. It is left to other projects and communities to build on this foundation and to introduce variation. It is anticipated that this foundation is continuously refined to reflect the advances made in derivative and alternative works in an effort to build and maintain compatibility and grow the *declarative composition community of tools and users*.

### What is `PINF.Genesis.ccjson`?

[PINF.Genesis](https://github.com/pinf/genesis.pinf.org) is a (work in progress) *Declarative Web Software Systems Domain Model and Manifestation Platform*.

This *Declarative Core-Composed System Template* is a crystalization of core primitives from the *PINF.Genesis* platform and will be leveraged within the *PINF.Genesis* platform to ready it for general use over time.

We do not **use** *PINF.Genesis* in this template but are *implementing one model* of the *PINF.Genesis approach* using minimal implementation and targeting it to **NodeJS** and **JavaScript** specifically. Whatever we do here will be compatible with the **much wider scoped** *PINF.Genesis* platform which targets many runtimes and languages when it is released for general use.

We already use the *PINF.Genesis.ccjson* file to get ready for when *PINF.Genesis* is released as this project will act as one reference implementation of a *PINF.Genesis* based system at that time.

`ccjson` is the config orchestration solution for Zero System and can be found here: [github.com/LogicCores/ccjson](https://github.com/LogicCores/ccjson)


Governance
==========

This project is governed by [Christoph Dorn](http://christophdorn.com) who is the original author and self-elected [Benevolent Dictator For Life](https://en.wikipedia.org/wiki/Benevolent_dictator_for_life) to continuously steer this project onto its originally intended goal of providing an **Open Source** and **Free Foundation** to build **Web Software Systems** on. **Every software user in the world** must be able to obtain a copy of Zero System and *deploy a customized instance* of it for **free; forever.**


Provenance
==========

Original source logic under [Free Public License](https://lists.opensource.org/pipermail/license-review/2015-October/001254.html) by [Christoph Dorn](http://christophdorn.com)

