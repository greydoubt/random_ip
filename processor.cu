// processor.c

#include "processor.h"
#include <iostream>
#include <vector>
#include <string>
#include <complex>
#include <cmath>
#include <yaml-cpp/yaml.h>

// (keep your TypedString, validators, FFT here unchanged)

// Forward declarations (reuse your earlier code)
using Complex = std::complex<double>;
void fft(std::vector<Complex>& a);

// -----------------------------
// Exported function
// -----------------------------
extern "C" int run_topology_processor(const char *yaml_file) {
    try {
        YAML::Node root = YAML::LoadFile(yaml_file);

        std::vector<double> numericSignal;

        for (const auto& child : root["children"]) {
            if (child["id"].as<std::string>() == "external") {

                for (const auto& node : child["children"]) {
                    if (node["type"].as<std::string>() == "host") {

                        std::string ip = node["id"].as<std::string>();

                        // reuse your IPv4 validator type
                        IPv4 validIP(ip);

                        double value = 0;
                        for (char c : ip) value += c;

                        numericSignal.push_back(value);
                    }
                }
            }
        }

        // Pad to power of 2
        size_t n = 1;
        while (n < numericSignal.size()) n <<= 1;
        numericSignal.resize(n, 0);

        std::vector<Complex> signal(n);
        for (size_t i = 0; i < n; i++) {
            signal[i] = Complex(numericSignal[i], 0);
        }

        fft(signal);

        std::cout << "FFT Output:\n";
        for (const auto& c : signal) {
            std::cout << std::abs(c) << "\n";
        }

        return 0;

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << "\n";
        return 1;
    }
}
