### How To Use

Add this step into workflow

```
- name: Set up Maven
  uses: hb0730/maven-action@latest
  with:
    maven-version: 3.8.2
    maven-file: ${{ runner.temp }}/apache-maven-3.8.2-bin.tar.gz
    url: https://downloads.apache.org/maven/maven-3/3.8.2/binaries/apache-maven-3.8.2-bin.tar.gz
```

## Options

- `maven-version` - **required** The version of maven to use. Default: `3.8.2`
- `maven-file` - The name of the maven file to use. example: `${{ runner.temp }}/apache-maven-3.8.2-bin.tar.gz`
- `url` - The url to download maven from. example: `https://downloads.apache.org/maven/maven-3/3.8.2/binaries/apache-maven-3.8.2-bin.tar.gz`

priority: `maven-file` > `url` > `maven-version`
