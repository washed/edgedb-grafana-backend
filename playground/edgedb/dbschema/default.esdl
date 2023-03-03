module default {
  type SomeTimeSeries {
    required property timestamp -> datetime;
    required property value -> float32;
  }

}
