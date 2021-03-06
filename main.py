from IPython.terminal.embed import InteractiveShellEmbed
from IPython.display import Markdown, display
import sys
import time

from api.reporting import Report
from knowledgerepr import fieldnetwork
from ddapi import API

init_banner = "Welcome to Aurum. \nYou can access the API via the object api"
exit_banner = "Bye!"


def print_md(string):
    display(Markdown(string))


def init_system(path_to_serialized_model, reporting=True):
    print_md('Loading: *' + str(path_to_serialized_model) + "*")
    sl = time.time()
    network = fieldnetwork.deserialize_network(path_to_serialized_model)
    api = API(network)
    if reporting:
        reporting = Report(network)
    api.init_store()
    api.help()
    el = time.time()
    print("Took " + str(el - sl) + " to load all data")
    return api, reporting


def main(path_to_serialized_model):
    print('Loading: ' + str(path_to_serialized_model))
    network = fieldnetwork.deserialize_network(path_to_serialized_model)
    api = API(network)
    api.init_store()
    ip_shell = InteractiveShellEmbed(banner1=init_banner, exit_msg=exit_banner)
    ip_shell()

if __name__ == "__main__":
    if len(sys.argv) >= 2:
        path_to_serialized_model = sys.argv[2]

    else:
        print("USAGE")
        print("db: the name of the model to serve")
        print("python web.py --db <db>")
        exit()
    main(path_to_serialized_model)
