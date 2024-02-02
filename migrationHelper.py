"""
this file creates segmented versions of a larger json file
"""

import json
import pprint
pp = pprint.PrettyPrinter(indent=4)

table_name = "pie_madness_ns_local"

with open("BatchWriteItem_ns.json") as loaded_file:
    file_dict = json.load(loaded_file)
    item_length = len(file_dict[table_name])
    counter = 1

    # each object has format of
    """
    {
        "pie_madness_ns_local":[
            <25 items go here>
        ]
    }
    """
    
    start = 0

    item_list = file_dict[table_name]

    num_of_files = ((item_length-1) // 25) + 1
    print('num of files', num_of_files)
    for i in range(num_of_files):
        end = start + 25
        print('----creating new dict-----')
        print('starting at', start)
        print('ending at', end)
        new_dict={
            table_name: item_list[start:end]
        }
        print('----created dict------')
        with open (f'data-{i+4}.json', "w") as output_file: 
            json.dump(new_dict, output_file)   
        start += 25
        