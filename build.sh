#!/bin/bash

set -e

# Base directory for this entire project
BASEDIR=$(cd $(dirname $0) && pwd)

# Source directory for unbuilt code
SRCDIR="$BASEDIR/src"

# Directory containing dojo build utilities
TOOLSDIR="$SRCDIR/util/buildscripts"

# Destination directory for built code
DISTDIR="$BASEDIR/dist"

# Module ID of the main application package loader configuration
LOADERMID="app/run"

# Main application package loader configuration
LOADERCONF="$SRCDIR/$LOADERMID.js"

# Main application package build configuration
PROFILE="$SRCDIR/app/app.profile.js"

# Get the current revision number from the current working copy
#REVISION=`svn info | sed -ne 's/^Revision: //p'`

# Configuration over. Main application start up!

if [ ! -d "$TOOLSDIR" ]; then
    echo "Can't find Dojo build tools -- did you initialise submodules? (git submodule update --init --recursive)"
    exit 1
fi

echo "Building application with $PROFILE to $DISTDIR."


if [ -f $DISTDIR/log.txt ]; then
    sudo mv $DISTDIR/log.txt ./log.txt
fi


echo -n "Cleaning old files..."
sudo rm -rf "$DISTDIR"
echo " Done"

cd "$TOOLSDIR"

if which node >/dev/null; then
    sudo node ../../dojo/dojo.js load=build --require "$LOADERCONF" --profile "$PROFILE" --releaseDir "$DISTDIR" "$@"
elif which java >/dev/null; then
    sudo java -Xms256m -Xmx256m  -cp ../shrinksafe/js.jar:../closureCompiler/compiler.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  ../../dojo/dojo.js baseUrl=../../dojo load=build --require "$LOADERCONF" --profile "$PROFILE" --releaseDir "$DISTDIR" "$@"
else
    echo "Need node.js or Java to build!"
    exit 1
fi

cd "$BASEDIR"

LOADERMID=${LOADERMID//\//\\\/}

sudo chmod 777 $DISTDIR

# Copy & minify index.html to dist
sudo sh -c "cat $SRCDIR/index.html | sed s/__REVISION__/revision/ | tr '\n' ' ' | perl -pe '
  s/<\!--.*?-->//g;                          # Strip comments
  s/isDebug: *1/deps:[\"$LOADERMID\"]/;        # Remove isDebug, add deps
  s/<script src=\"$LOADERMID.*?\/script>//;  # Remove script app/run
  s/\s+/ /g;                                 # Collapse white-space' > $DISTDIR/index.html"
  
  
#sudo echo "Build $REVISION on $(date)" >> ./log.txt

sudo mv ./log.txt $DISTDIR/log.txt

sudo find $DISTDIR -name *.uncompressed.js -print0 | sudo xargs -0 rm -rf
  

echo "Build complete"
