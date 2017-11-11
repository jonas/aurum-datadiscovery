# Aurum: Discovering Data in Lakes, Clouds and Databases

Aurum helps users identify relevant content among multiple data
sources that may consist of tabular files, such as CSV, and relational tables.
These may be stored in relational database management systems (RDBMS), file
systems, and they may live in cloud services, data lakes or other on-premise
repositories.

Aurum helps you find data through different interfaces. The most flexible one is
an API of primitives that can be composed to build queries that describe the
data of interest. For example, you can write a query that says "find tables that
contain a column with name 'ID' and have at least one column that looks like
an input column". You can also query with very simple primitives, such as "find
columns that contain the keyword 'caffeine'". You can also do more complex
queries, such as figuring out what tables join with a table of interest. The
idea is that the API is flexible enough to allow a wide range of use cases, and
that it works over all data you feed to the system, regardless where these live.

Aurum consists of three independent modules that work together to achieve all
the above. We explain briefly each module next:

* **DDProfiler:** The ddprofiler is in charge of reading the data from wherever it
lives (e.g., CSV files, tables, the cloud or an on-premise lake) and create a
set of summaries that succintly represent the data in a way that allows us to
discover it later. All the data summaries are stored in a store, which at the
moment is elasticsearch.

* **Model Builder:** The model builder is in charge of creating a model that can
respond to the different user queries. To build this model, the
networkbuildercoordinator.py will read the data summaries created by the
profiler from the store (elasticsearch) and will output the model to another
store, which for now is simply a pickle serialization. 

* **Front-end API:** Last, the front-end API contains the primitives and utilities
to allow users to create discovery queries. The API is configured with the path
to an existing model, which represents some underlying data. The API primitives
are then combined and query both elasticsearch and the model to answer users'
queries.

This project is a work-in-progress. We give some detail on how to use each
module below. Note this will be changing often as part of the development.

## Quick Start

```shell
git clone git@github.com:mitdbg/aurum-datadiscovery.git
cd aurum-datadiscovery
```

We explain next how to configure the modules to get a barebones installation. We
do this in a series of 3 stages.

### Stage 1: Configuring DDProfiler

The profiler is built in Java (you can find it under /ddprofiler). The input are
data sources (files and tables) to analyze and the output is stored in
elasticsearch. Next, you can find instructions to build and deploy the profiler as well as
to install and configure Elasticsearch.

#### Building ddprofiler

Just go to 'ddprofiler' (/ddprofiler from the project root) and do:

```shell
$> ./gradlew clean fatJar
```

Note that the gradle wrapper (gradlew) does not require you to install any
software; it will handle the entire build process without assistance. A
requirement of this process is to have a JVM 8 available in the system. The
above command will produce a single jar file available in
'ddprofiler/build/libs/ddprofiler.jar'.

#### Deploying Elasticsearch (tested with 2.3.3)

Download the software (note the currently supported version is 2.3.3) from:

https://www.elastic.co/products/elasticsearch

Uncompress it and then simply run from the root directory:

```shell
$> ./bin/elasticsearch
```

that will start the server in localhost:9200 by default, which is the address
you should use to configure ddprofiler as we show next.

#### Configuration of ddprofiler

We are currently building an interface to interact programmatically with the
profiler, but for now, it is possible to configure it through the command line.

The jar file produced in the previous step accespt a number of flags, of which
the most relevant ones are:

**--db.name** When you point to a data source (RDBMS or folder), you can give it a name, which will be
used in the model to identify such data source.

**--execution.mode** configures how the profiler will work. The current options
are: (0) to work online. (1) to read files from a folder. (2) to read the tables
in a repository of data accessible through JDBC, such as a RDBMS.

If you configure ddprofiler with (1), that is, you want to read a repository of
CSV files, then you need to set up the following flag as well to indicate the
path to the folder:

**--sources.folder.path** when execution mode is 1, this option indicates the folder
with the files to process (CSV files only for now).

If you wish to read the tables from a database, then you should configure
**--execution.mode** to 2, the system will read the configuration from:

`ddprofiler/src/main/resources/dbconnector.config`

which you can consult as a template.

A typical usage of the profiler from the command line will look like:

Example:

```shell
$> java -jar <path_to_ddprofiler.jar> --db.name <name> --execution.mode 1
--sources.folder.path <path>
```

You can consult all configuration parameters by appending **--help** or <?> as a
parameter. In particular you may be interested in changing the default
elasticsearch ports (consult *--store.http.port* and *--store.port*) in case
your installation does not use the default ones.

Also, note that you can run ddprofiler as many times as necessary using
different data sources as input. For example, if you want to index a repository
of CSV files and a RDBMS, you will need to run ddprofiler two times, each one
configured to read the data from each source. All data summaries will be created
and stored in elasticsearch. Only make sure that every time you run ddprofiler
you use a different **--db.name** to avoid internal conflicts.

### Stage 2: Building a Model

Once you have used the ddprofiler to create data summaries of all the data
sources you want, the second stage will read those and create a model. We
briefly explain next the requirements for running the model builder.

#### Requirements

*As typical with Python deployments, we recommend using a virtualenvironment (see
virtualenv) so that you can quickly wipeout the environment if you no longer
need it without affecting any system-wide dependencies.* 

Requires Python 3 (tested with 3.4.2, 3.5.0 and 3.5.1). Use requirements.txt to
install all the dependencies:

```shell
$> pip install -r requirements.txt
```

In a vanilla linux (debian-based) system, the following packages will need to be installed system-wide:

```shell
sudo apt-get install \
     pkg-config libpng-dev libfreetype6-dev `#(requirement of matplotlib)` \
     libblas-dev liblapack-dev `#(speeding up linear algebra operations)` \
     lib32ncurses5-dev
```

Some notes for MAC users:

There have been some problems with uWSGI. One quick workaround is to 
remove the version contraint explained in the requirements.txt file. 

Note you need to use elasticsearch 2.3.3 in the current version.

#### Deployment

The model builder is executed from 'networkbuildercoordinator.py', which takes
exactly one parameter, **--opath**, that expects a path to an existing folder
where you want to store the built model (in the form of Python pickle files).
For example:

```shell
$> python networkbuildercoordinatory.py --opath test/testmodel/
```

Once the model is built, it will be serialized and stored in the provided path.

### Stage 3: Accessing the discovery API

The file ddapi.py is the core implementation of Aurum's API. One easy way to
access it is to deserialize a desired model and constructing an API object with
that model. The easiest way to do so is by importing init_system() function from
main. Something like:

```python
from main import init_system
api, reporting = init_system(<path_to_serialized_model>, reporting=False)
```

The last parameter of init_system, reporting, controls whether you want to
create a reporting API that gives you access to statistics about the model. Feel
free to say yes, but beware that it may take long times when the models are big.

## Using the Discovery API

The discovery API consists of a collection of primitives that can be combined
together to write more complex data discovery queries. Consider a scenario in
which you want to identify buildings at MIT. There is a discovery primitive to
search for specific values in a column, e.g., "Stata Center". There is another
primitive to find a column with a specific schema name, e.g., "Building Name".
If you use any of them individually, you may find a lot of values, with only a
subset being relevant, e.g., many organizations may have a table that contains a
columns named "Building Name". Combining both of them makes the purpose more
specific and therefore narrows down the qualifying data, hopefully yielding
relevant results.

To use the discovery API it is useful to know about the primitives available and
about two special objects that we use to connect the primitives together and
help you navigate the results. These objects are the **API Handler** and the
**Discovery Result Set (DRS)**. We describe them both next:

**API Handler**: This is the object that you obtain when initializing the API,
that is:

```python
api, reporting = init_system(<path_to_serialized_model>, reporting=False)
```

The API Handler gives you access to the different primitives available in the
system, so it should be the first object to inspect when learning how to use the
system.

The *Discovery Result Set (DRS)* is an object that essentially represents data
within the discovery system. For example, by creating a DRS over a table in a
storage system, we are creating a reference to that table, that can be used with
the primitives. If, for example, we want to identify columns similar to a column
*A* of interest, we will need to obtain first a reference to column *A* that we
can use in the API. That reference is the DRS, and we provide several primitives
to obtain these references. Then, if we run a similarity primitive on column
*A*, the results will also be available in a DRS object --- this is what allows
to arbitrarily combine primitives together.

DRS objects have a few functions that help to inspect their content, for
example, to print the tables they represent or the columns they represent. The
more nuanced aspect of DRS is that they have an internal state that determines
whether they represent *tables* or *columns*. This is the most important aspect
to understand about the Aurum discovery API, really. We explain it in some
detail next:

Consider the *intersection* primitive, which helps in combining two DRS by
taking their intersection, e.g., similar content *and* similar schema. It is
possible to intersect at the table (tables that appear in both DRS) or column
level (columns that appear in both of them), and this can be achieved by setting
the status of the input DRS to table or column.


### Example Discovery Queries

Soon...

### Ranking Results

Soon...

### Analytical Queries over the Model

Soon...
