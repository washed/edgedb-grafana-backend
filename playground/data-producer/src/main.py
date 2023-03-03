from datetime import datetime
from random import random
from time import sleep

import edgedb
from pytz import utc


if __name__ == "__main__":
    print("Hello World!")
    client = edgedb.create_client(
        dsn="edgedb://edgedb:secret@edgedb:5656/edgedb?tls_security=insecure"
    )

    try:
        while True:
            print("Inserting into SomeTimeSeries")
            client.query(
                """
                INSERT SomeTimeSeries {
                    timestamp := <datetime>$timestamp,
                    value := <float32>$value
                }
                """,
                timestamp=utc.localize(datetime.utcnow()),
                value=random(),
            )
            sleep(1)
    except Exception as exc: # pylint: disable=broad-except
        print("Something terrible happened:", exc)
        client.close()
