// fast_yaml_fft

#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
#include <complex>
#include <cmath>
#include <yaml-cpp/yaml.h>

// -----------------------------
// Typed String Wrappers
// -----------------------------

template<typename Tag>
class TypedString {
    std::string value;

public:
    explicit TypedString(const std::string& v) : value(v) {
        if (!Tag::validate(v)) {
            throw std::invalid_argument("Invalid value: " + v);
        }
    }

    const std::string& str() const { return value; }
};

// -----------------------------
// Validators
// -----------------------------

struct IPv4Tag {
    static bool validate(const std::string& ip) {
        int dots = 0;
        int num = 0;
        int len = 0;

        for (char c : ip) {
            if (c == '.') {
                if (len == 0 || num > 255) return false;
                dots++;
                num = 0;
                len = 0;
            } else if (isdigit(c)) {
                num = num * 10 + (c - '0');
                len++;
                if (len > 3) return false;
            } else return false;
        }
        return dots == 3 && num <= 255;
    }
};

struct IPv6Tag {
    static bool validate(const std::string& ip) {
        int colons = 0;
        for (char c : ip) {
            if (c == ':') colons++;
            else if (!isxdigit(c)) return false;
        }
        return colons >= 2; // simplified
    }
};

struct PortTag {
    static bool validate(const std::string& p) {
        int num = 0;
        for (char c : p) {
            if (!isdigit(c)) return false;
            num = num * 10 + (c - '0');
        }
        return num >= 0 && num <= 65535;
    }
};

using IPv4 = TypedString<IPv4Tag>;
using IPv6 = TypedString<IPv6Tag>;
using Port = TypedString<PortTag>;

// -----------------------------
// FFT (Cooley-Tuk)
// -----------------------------

using Complex = std::complex<double>;

void fft(std::vector<Complex>& a) {
    size_t n = a.size();
    if (n <= 1) return;

    std::vector<Complex> even(n/2), odd(n/2);
    for (size_t i = 0; i < n/2; i++) {
        even[i] = a[i*2];
        odd[i] = a[i*2+1];
    }

    fft(even);
    fft(odd);

    for (size_t k = 0; k < n/2; k++) {
        Complex t = std::polar(1.0, -2 * M_PI * k / n) * odd[k];
        a[k] = even[k] + t;
        a[k + n/2] = even[k] - t;
    }
}

// -----------------------------
// YAML Processing
// -----------------------------

template<typename IPType>
std::vector<IPType> parseIPs(const YAML::Node& nodes) {
    std::vector<IPType> result;

    for (const auto& n : nodes) {
        std::string ip = n["id"].as<std::string>();
        result.emplace_back(IPType(ip));
    }

    return result;
}

// -----------------------------
// Example Processing Pipeline
// -----------------------------

int main() {
    try {
        YAML::Node root = YAML::LoadFile("topology.yaml");

        std::vector<double> numericSignal;

        // Traverse external nodes
        for (const auto& child : root["children"]) {
            if (child["id"].as<std::string>() == "external") {

                for (const auto& node : child["children"]) {
                    if (node["type"].as<std::string>() == "host") {

                        std::string ip = node["id"].as<std::string>();

                        // Validate IPv4
                        IPv4 validIP(ip);

                        // Convert IP to numeric signal (simple hash)
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

        // Run FFT
        fft(signal);

        std::cout << "FFT Output:\n";
        for (const auto& c : signal) {
            std::cout << std::abs(c) << "\n";
        }

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << "\n";
    }
}
