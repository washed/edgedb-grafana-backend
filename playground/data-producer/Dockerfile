FROM python

WORKDIR /usr/src/app

RUN pip install edgedb pytz

COPY src/ /usr/src/app/

ENTRYPOINT [ "python", "-m", "main" ]
